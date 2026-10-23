import { QueryOptions } from '../../commands/QueryOptions.js';
import type {
    NewsByIdResult,
    NewsListPayload,
    RelatedNewsResult,
} from '../NewsService.js';

export interface INewsService {
    getNews(
        queryOptions: QueryOptions,
    ): Promise<{ data: NewsListPayload; fromCache: boolean }>;
    getNewsById(queryOptions: QueryOptions): Promise<NewsByIdResult | null>;
    getRelatedNews(queryOptions: QueryOptions): Promise<RelatedNewsResult | null>;
}
