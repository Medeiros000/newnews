// backend/src/services/newsIngestion/NewsValidator.ts
import { z } from 'zod';
import { NormalizedNews } from './NewsNormalizer.js';

export const newsValidationSchema = z.object({
    category_id: z.string().uuid('category_id inválido'),
    badge_bg: z.string().max(20).default('bg-blue-500'),
    title: z.string().min(1).max(255),
    summary: z.string().min(1),
    content: z.string().min(1),
    image_url: z.string().url().max(2048),
    published_at: z.date(),
    author: z.string().max(120).default('Redação'),
    source: z.string().max(120),
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
