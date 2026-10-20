import { CurrentsApiClient } from './CurrentsApiClient.js';
import { NewsNormalizer } from './NewsNormalizer.js';
import { NewsValidator } from './NewsValidator.js';
import { NewsDeduplicator } from './NewsDeduplicator.js';
import { NewsRepository } from './NewsRepository.js';
import { PrismaService } from '../../lib/prisma.js';
import { RedisService } from '../../lib/redis.js';

export class NewsIngestionPipeline {
    private readonly deduplicator: NewsDeduplicator;
    private readonly repository: NewsRepository;
    private readonly apiClient: CurrentsApiClient;
    private readonly normalizer: NewsNormalizer;
    private readonly validator: NewsValidator;

    constructor(
        private readonly prisma: PrismaService,
        private readonly cache?: RedisService,
    ) {
        this.deduplicator = new NewsDeduplicator(prisma);
        this.repository = new NewsRepository(prisma, cache);
        this.apiClient = new CurrentsApiClient();
        this.normalizer = new NewsNormalizer();
        this.validator = new NewsValidator();
    }

    private resolveCategoryId(
        categoryName: string | undefined,
        categories: Array<{ id: string; name: string }>,
    ): string | undefined {
        if (!categoryName) return undefined;

        const normalizedCategoryName = categoryName.toLowerCase();
        const exactCategory = categories.find(
            (category) => category.name.toLowerCase() === normalizedCategoryName,
        );
        if (exactCategory) return exactCategory.id;

        const relatedCategory = categories.find((category) =>
            category.name.toLowerCase().split('_').includes(normalizedCategoryName),
        );
        return relatedCategory?.id;
    }

    async execute() {
        console.log('🔄 Iniciando ingestão de notícias (POO)...');

        const rawArticles = await this.apiClient.fetchLatestNews();
        if (rawArticles.length === 0) {
            console.log('⚠️ Nenhuma notícia obtida da API.');
            return;
        }

        const categories = await this.prisma.category.findMany({
            select: { id: true, name: true },
        });
        const generalCategoryId = categories.find((category) => category.name === 'general')?.id;
        if (!generalCategoryId) {
            throw new Error('Categoria padrão "general" não encontrada no banco de dados.');
        }

        // Processa todos os artigos retornados pela API (sem slice arbitrário)
        const processedItems = [];
        for (const raw of rawArticles) {
            const categoryName = raw.category?.[0]?.trim();
            const categoryId = categoryName
                ? this.resolveCategoryId(categoryName, categories)
                : generalCategoryId;

            if (!categoryId) {
                console.warn(
                    `⚠️ Categoria não encontrada para "${raw.title || 'Notícia sem título'}": ${categoryName || 'não informada'}`,
                );
                continue;
            }

            const normalized = this.normalizer.normalize(raw, categoryId);
            const validated = this.validator.validate(normalized);
            if (validated) {
                processedItems.push(validated);
            }
        }

        // Remove duplicadas em lote (1 única query ao banco)
        const uniqueItems = await this.deduplicator.filterDuplicates(processedItems);

        // Salva com tolerância a falhas individuais (1 erro não cancela o lote todo)
        let savedCount = 0;
        for (const item of uniqueItems) {
            try {
                const saved = await this.repository.save(item);
                console.log(`✅ Notícia salva! ID: ${saved.id} | "${item.title.slice(0, 60)}..."`);
                savedCount++;
            } catch (err: any) {
                console.error(`❌ Erro ao salvar "${item.title.slice(0, 60)}": ${err.message}`);
            }
        }

        // Invalida cache de listagem caso novas notícias tenham sido adicionadas
        if (savedCount > 0 && this.cache) {
            await this.cache.delByPattern('news:list:*');
            console.log('🧹 Cache de listagem de notícias invalidado com sucesso.');
        }

        console.log(
            `✨ Ingestão finalizada! ${savedCount}/${uniqueItems.length} notícias únicas salvas.`,
        );
    }
}
