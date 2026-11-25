import { Tag } from '../../models/entities/Tag.js';
import { News } from '../../models/entities/News.js';
import { QueryOptions } from '../../queries/QueryOptions.js';

export interface ITagService {
  getTags(searchQuery?: string, limit?: number): Promise<Tag[]>;
  getNewsByTagSlug(slug: string, queryOptions: QueryOptions): Promise<{ tag: Tag; news: News[] } | null>;
}
