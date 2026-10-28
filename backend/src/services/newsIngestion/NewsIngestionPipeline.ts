import { FetchNewsHandler } from './handlers/FetchNewsHandler.js';
import { NormalizationHandler } from './handlers/NormalizationHandler.js';
import { ValidationHandler } from './handlers/ValidationHandler.js';
import { DeduplicationHandler } from './handlers/DeduplicationHandler.js';
import { NewsInsertionHandler } from './handlers/NewsInsertionHandler.js';
import { CacheEvictionHandler } from './handlers/CacheEvictionHandler.js';
import { Logger } from '../../utils/Logger.js';

export class NewsIngestionPipeline {
  private readonly logger = new Logger('NewsIngestionPipeline');
  private readonly fetchHandler: FetchNewsHandler;
  private readonly normalizerHandler: NormalizationHandler;
  private readonly validatorHandler: ValidationHandler;
  private readonly deduplicatorHandler: DeduplicationHandler;
  private readonly insertionHandler: NewsInsertionHandler;
  private readonly cacheEvictionHandler: CacheEvictionHandler;

  public constructor(
    fetchHandler: FetchNewsHandler = new FetchNewsHandler(),
    cacheEvictionHandler: CacheEvictionHandler = new CacheEvictionHandler(),
  ) {
    this.fetchHandler = fetchHandler;
    this.cacheEvictionHandler = cacheEvictionHandler;
    this.normalizerHandler = new NormalizationHandler();
    this.validatorHandler = new ValidationHandler();
    this.deduplicatorHandler = new DeduplicationHandler();
    this.insertionHandler = new NewsInsertionHandler();

    this.setupChain();
  }

  private setupChain(): void {
    this.normalizerHandler
      .setNext(this.validatorHandler)
      .setNext(this.deduplicatorHandler)
      .setNext(this.insertionHandler);
  }

  public async execute(): Promise<void> {
    this.logger.info('Iniciando pipeline de ingestão de notícias...');

    const rawArticles = await this.fetchHandler.handle();
    if (!rawArticles || rawArticles.length === 0) {
      return;
    }

    for (const raw of rawArticles) {
      await this.normalizerHandler.handle(raw);
    }

    const savedCount = this.insertionHandler.getInsertedCount();

    if (savedCount > 0) {
      await this.cacheEvictionHandler.invalidateCache();
    }

    this.logger.info(
      `Ingestão concluída. ${savedCount} notícias salvas de ${rawArticles.length} recebidas.`,
    );
  }
}
