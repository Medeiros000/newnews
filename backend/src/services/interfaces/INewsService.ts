import { News } from '../../models/entities/News.js';
import { QueryOptions } from '../../queries/QueryOptions.js';
import { CreateNewsDto } from '../../dtos/CreateNewsDto.js';


export interface INewsService {
    getNews(queryOptions: QueryOptions): Promise<News[]>;
    createNews(input: CreateNewsDto): Promise<News>;
    getNewsById(queryOptions: QueryOptions): Promise<News | null>;
    getRelatedNews(queryOptions: QueryOptions): Promise<News[] | null>;
    getNewsBySlug(queryOptions: QueryOptions): Promise<News | null>;
}
