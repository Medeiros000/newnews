import { CurrentsArticle } from '../CurrentsApiClient.js';
import { NewsNormalizer, type NormalizedNews } from '../NewsNormalizer.js';
import { AbstractNewsHandler } from './INewsHandler.js';
import { Logger } from '../../../utils/Logger.js';

export class NormalizationHandler extends AbstractNewsHandler<CurrentsArticle, NormalizedNews> {
  private readonly logger = new Logger('NormalizationHandler');
  private readonly normalizer: NewsNormalizer;

  public constructor(normalizer: NewsNormalizer = new NewsNormalizer()) {
    super();
    this.normalizer = normalizer;
  }

  public async handle(raw: CurrentsArticle): Promise<NormalizedNews | null> {
    try {
      const normalized = this.normalizer.normalize(raw);
      return this.passToNext(normalized);
    } catch (error: any) {
      this.logger.error('Falha na normalização do artigo:', error?.message || error);
      return null;
    }
  }
}
