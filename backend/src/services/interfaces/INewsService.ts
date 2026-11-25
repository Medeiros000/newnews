import { News } from '../../models/entities/News.js';
import { QueryOptions } from '../../queries/QueryOptions.js';

export interface CreateNewsDTO {
  title: string;
  description: string;
  url: string;
  author?: string;
  image_url?: string;
  language?: string;
  category: string;
  published_at?: Date;
  tags?: string[];
}

export interface UpdateNewsDTO {
  title?: string;
  description?: string;
  url?: string;
  author?: string;
  image_url?: string;
  language?: string;
  category?: string;
  published_at?: Date;
  tags?: string[];
}

export interface INewsService {
  getNews(queryOptions: QueryOptions): Promise<News[]>;
  getNewsById(queryOptions: QueryOptions): Promise<News | null>;
  getNewsBySlugAndIdPrefix(slug: string, idPrefix: string): Promise<News | null>;
  getRelatedNews(queryOptions: QueryOptions): Promise<News[] | null>;
  createNews(data: CreateNewsDTO): Promise<News>;
  updateNews(id: string, data: UpdateNewsDTO): Promise<News | null>;
  deleteNews(id: string): Promise<boolean>;
}
