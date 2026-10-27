import { NormalizedNews } from '../NewsNormalizer.js';
import { NewsRepository } from '../NewsRepository.js';
import { AbstractNewsHandler } from './INewsHandler.js';

export class PersistenceHandler extends AbstractNewsHandler {
    private savedCount = 0;
    private readonly repository: NewsRepository;

    public constructor(repository: NewsRepository = new NewsRepository()) {
        super();
        this.repository = repository;
    }

    public async handle(news: NormalizedNews): Promise<NormalizedNews | null> {
        try {
            const saved = await this.repository.save(news);
            console.log(`✅ Notícia salva! ID: ${saved.id} | "${news.title.slice(0, 60)}..."`);
            this.savedCount++;
            return this.passToNext(news);
        } catch (err: any) {
            console.error(`❌ Erro ao salvar "${news.title.slice(0, 60)}": ${err.message}`);
            return null;
        }
    }

    public getSavedCount(): number {
        return this.savedCount;
    }
}

