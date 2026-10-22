import { randomUUID } from 'node:crypto';
import { CurrentsApiClient } from './CurrentsApiClient.js';
import { NewsNormalizer } from './NewsNormalizer.js';
import { NewsValidator } from './NewsValidator.js';
import { NewsDeduplicator } from './NewsDeduplicator.js';
import { NewsRepository } from './NewsRepository.js';
import { PrismaService } from '../PrismaServce.js';
import { RedisService } from '../RedisService.js';

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

    async execute() {
        const categoryId = process.env.DEFAULT_CATEGORY_UUID || randomUUID();
        console.log(`Usando category_id: ${categoryId}`);
        console.log('🔄 Iniciando ingestão de notícias (POO)...');

        const rawArticles = await this.apiClient.fetchLatestNews();
        if (rawArticles.length === 0) {
            console.log('⚠️ Nenhuma notícia obtida da API.');
            return;
        }

        // Processa todos os artigos retornados pela API (sem slice arbitrário)
        const processedItems = [];
        for (const raw of rawArticles) {
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
