import { CurrentsApiClient, type CurrentsArticle } from '../CurrentsApiClient.js';
import { AbstractNewsHandler } from './INewsHandler.js';
import { Logger } from '../../../utils/Logger.js';

export class FetchNewsHandler extends AbstractNewsHandler<void, CurrentsArticle[]> {
  private readonly logger = new Logger('FetchNewsHandler');
  private readonly apiClient: CurrentsApiClient;

  public constructor(apiClient: CurrentsApiClient = new CurrentsApiClient()) {
    super();
    this.apiClient = apiClient;
  }

  public async handle(): Promise<CurrentsArticle[] | null> {
    this.logger.info('Iniciando busca de notícias na Currents API...');
    const articles = await this.apiClient.fetchLatestNews();

    if (articles.length === 0) {
      this.logger.warn('Nenhuma notícia retornada pela Currents API.');
      return null;
    }

    this.logger.info(`${articles.length} notícias obtidas com sucesso.`);
    return this.passToNext(articles);
  }
}
