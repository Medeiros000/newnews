import { RedisService } from '../../RedisService.js';
import type { NormalizedNews } from '../NewsNormalizer.js';
import { AbstractNewsHandler } from './INewsHandler.js';
import { Logger } from '../../../utils/Logger.js';

export class CacheEvictionHandler extends AbstractNewsHandler<NormalizedNews, NormalizedNews> {
    private readonly logger = new Logger('CacheEvictionHandler');
    private readonly redis: RedisService;
    private readonly pattern: string;

    public constructor(
        redis: RedisService = RedisService.getInstance(),
        pattern: string = 'news:list:*',
    ) {
        super();
        this.redis = redis;
        this.pattern = pattern;
    }

    public async handle(news: NormalizedNews): Promise<NormalizedNews | null> {
        try {
            await this.invalidateCache();
            return this.passToNext(news);
        } catch (error: any) {
            this.logger.warn(`Erro ao invalidar cache no padrão "${this.pattern}":`, error?.message || error);
            return this.passToNext(news);
        }
    }

    public async invalidateCache(): Promise<void> {
        if (this.redis) {
            await this.redis.delByPattern(this.pattern);
            this.logger.info(`Cache invalidado com sucesso para o padrão: "${this.pattern}".`);
        }
    }
}
