import type { NormalizedNews } from '../NewsNormalizer.js';
import { NewsRepository } from '../NewsRepository.js';
import { AbstractNewsHandler } from './INewsHandler.js';
import { Logger } from '../../../utils/Logger.js';

export class NewsInsertionHandler extends AbstractNewsHandler<NormalizedNews, NormalizedNews> {
    private readonly logger = new Logger('NewsInsertionHandler');
    private insertedCount = 0;
    private readonly repository: NewsRepository;

    public constructor(repository: NewsRepository = new NewsRepository()) {
        super();
        this.repository = repository;
    }

    public async handle(news: NormalizedNews): Promise<NormalizedNews | null> {
        try {
            const saved = await this.repository.save(news);
            this.logger.info(`Notícia inserida! ID: ${saved.id} | "${news.title.slice(0, 60)}..."`);
            this.insertedCount++;
            return this.passToNext(news);
        } catch (err: any) {
            this.logger.error(`Erro ao inserir notícia "${news.title.slice(0, 60)}":`, err?.message || err);
            return null;
        }
    }

    public getInsertedCount(): number {
        return this.insertedCount;
    }
}
