
import { z } from 'zod';

export const newsItemSchema = z.object({
  category_id: z.string().uuid('category_id deve ser um UUID válido'),
  badgeBg: z.string().max(20).optional().default('bg-blue-500'),
  title: z.string().min(1, 'title é obrigatório').max(255),
  summary: z.string().min(1, 'summary é obrigatório'),
  content: z.string().min(1, 'content é obrigatório'),
  image_url: z.string().url('image_url deve ser uma URL válida').max(2048),
  publishedAt: z.string().datetime('publishedAt deve ser uma data/hora válida'),
  author: z.string().max(120).optional().default('Redação'),
  source: z.string().max(120),
  isHero: z.boolean().default(false),
});

export type NewsItemInput = z.infer<typeof newsItemSchema>;

export function validateNewsItem(data: any): NewsItemInput | null {
  const result = newsItemSchema.safeParse(data);
  if (!result.success) {
    console.error('❌ Falha na validação Zod:', result.error.format());
    return null;
  }
  return result.data;
}