import { News } from '../models/entities/News.js';

export class NewsMapper {
	static toDomain(raw: any): News {
		return new News(
			raw.id,
			raw.category_id,
			raw.title,
			raw.description,
			raw.url,
			raw.author,
			raw.image_url,
			raw.language,
			raw.source,
			raw.published_at,
		);
	}

	static toDomainList(rawList: any[]): News[] {
		return rawList.map((item) => NewsMapper.toDomain(item));
	}
}
