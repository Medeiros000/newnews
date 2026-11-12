import { z } from 'zod';
import { NormalizedNews } from './NewsNormalizer.js';

export const newsValidationSchema = z.object({
	id: z.string().min(1).optional(),
	title: z.string().min(1).max(255),
	description: z.string().min(1).max(1000),
	url: z.url().max(2048).optional(),
	author: z.string().min(1).max(120),
	image_url: z.url().max(2048),
	language: z.string().min(1).max(10),
	category: z.string().min(1).max(120),
	published_at: z.date(),
	source: z.string().min(1).max(120),
});

export class NewsValidator {
	validate(data: NormalizedNews): NormalizedNews | null {
		const result = newsValidationSchema.safeParse(data);
		if (!result.success) {
			console.error(' Falha na validação Zod:', result.error.format());
			return null;
		}
		return result.data;
	}
}
