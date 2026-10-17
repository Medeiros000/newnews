import { z } from 'zod';

export const getRelatedNewsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'O ID da notícia é obrigatório'), // ou z.number() se for ID numérico
  }),
  query: z.object({
    limit: z.string().optional().default('4').transform(val => parseInt(val, 10)), // converte string para número
  }),
});

export type GetRelatedNewsInput = z.infer<typeof getRelatedNewsSchema>;