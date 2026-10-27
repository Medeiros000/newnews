import { CurrentsApiClient } from './CurrentsApiClient.js';
import { NewsNormalizer } from './NewsNormalizer.js';
import { NewsRepository } from './NewsRepository.js';
import { PrismaService } from '../PrismaService.js';
import { RedisService } from '../RedisService.js';
import { ValidationHandler } from './handlers/ValidationHandler.js';
import { DeduplicationHandler } from './handlers/DeduplicationHandler.js';
import { PersistenceHandler } from './handlers/PersistenceHandler.js';

export class NewsIngestionPipeline {
    private readonly repository: NewsRepository;
    private readonly apiClient: CurrentsApiClient;
    private readonly normalizer: NewsNormalizer;

    public constructor(
        private readonly prisma: PrismaService = PrismaService.getInstance(),
        private readonly redis: RedisService = RedisService.getInstance(),
    ) {
        this.repository = new NewsRepository();
        this.apiClient = new CurrentsApiClient();
        this.normalizer = new NewsNormalizer();
    }

    public async execute(): Promise<void> {
        console.log('🔄 Iniciando ingestão de notícias (Chain of Responsibility)...');

        const rawArticles = await this.apiClient.fetchLatestNews();
        if (rawArticles.length === 0) {
            console.log('⚠️ Nenhuma notícia obtida da API.');
            return;
        }

        // Etapa 1: normaliza todos os artigos brutos
        const normalizedArticles = rawArticles.map((raw) => this.normalizer.normalize(raw));

        // Etapa 2: pré-carrega títulos e slugs existentes em uma única query (otimização de lote)
        const titles = normalizedArticles.map((a) => a.title);
        const slugs = normalizedArticles.map((a) => a.slug);
        const existingRecords = await this.prisma.news.findMany({
            where: {
                OR: [{ title: { in: titles } }, { slug: { in: slugs } }],
            },
            select: { title: true, slug: true },
        });
        const existingTitles = new Set(existingRecords.map((r) => r.title));
        const existingSlugs = new Set(existingRecords.map((r) => r.slug));

        // Etapa 3: monta a cadeia — Validação → Deduplicação → Persistência
        const persistence = new PersistenceHandler();
        const deduplication = new DeduplicationHandler(existingTitles, existingSlugs);
        const validation = new ValidationHandler();

        validation.setNext(deduplication).setNext(persistence);

        // Etapa 4: cada artigo percorre a cadeia individualmente;
        // cada handler decide continuar ou interromper o fluxo
        for (const article of normalizedArticles) {
            await validation.handle(article);
        }

        const savedCount = persistence.getSavedCount();

        if (savedCount > 0 && this.redis) {
            await this.redis.delByPattern('news:list:*');
            console.log('🧹 Cache de listagem de notícias invalidado com sucesso.');
        }

        console.log(
            `✨ Ingestão finalizada! ${savedCount} notícias salvas de ${rawArticles.length} recebidas.`,
        );
    }
}
