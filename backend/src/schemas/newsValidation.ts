import { z } from 'zod';

export const newsQuerySchema = z
  .object({
    query: z.string().trim().max(200).optional(),
    q: z.string().trim().max(200).optional(),
    category: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .transform(({ query, q, ...pagination }) => ({
    query: query || q,
    ...pagination,
  }));

export const relatedNewsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'O ID da notícia é obrigatório'),
  }),
  query: z.object({
    limit: z.coerce.number().int().min(1).max(50).default(4),
  }),
});