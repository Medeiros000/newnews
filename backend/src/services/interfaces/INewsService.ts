import { News } from '../../models/entities/News.js';
import { QueryOptions } from '../../queries/QueryOptions.js';

export interface INewsService {
  getNews(queryOptions: QueryOptions): Promise<News[]>;
  getNewsById(queryOptions: QueryOptions): Promise<News | null>;
  getNewsBySlugAndIdPrefix(slug: string, idPrefix: string): Promise<News | null>;
  getRelatedNews(queryOptions: QueryOptions): Promise<News[] | null>;
}
