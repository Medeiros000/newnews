import { z } from 'zod';

export const newsQuerySchema = z
	.object({
		query: z.string().trim().max(200).optional(),
		q: z.string().trim().max(200).optional(),
		category: z.string().trim().optional(),
		tag: z.string().trim().optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(10),
	})
	.transform(({ query, q, ...rest }) => ({
		query: query || q,
		...rest,
	}));

export const createNewsSchema = z.object({
	title: z.string().trim().min(1, 'O título é obrigatório').max(255),
	description: z.string().trim().min(1, 'A descrição é obrigatória').max(2000),
	url: z.string().url('URL inválida').max(2048),
	author: z.string().trim().min(1).max(120).default('Redação'),
	image_url: z.string().url('URL da imagem inválida').max(2048).optional(),
	language: z.string().trim().min(1).max(10).default('pt-BR'),
	category: z.string().trim().min(1, 'A categoria é obrigatória'),
	published_at: z.coerce.date().optional(),
	tags: z.array(z.string().trim().min(1)).max(20).optional(),
});

export const updateNewsSchema = z.object({
	title: z.string().trim().min(1).max(255).optional(),
	description: z.string().trim().min(1).max(2000).optional(),
	url: z.string().url().max(2048).optional(),
	author: z.string().trim().min(1).max(120).optional(),
	image_url: z.string().url().max(2048).optional(),
	language: z.string().trim().min(1).max(10).optional(),
	category: z.string().trim().min(1).optional(),
	published_at: z.coerce.date().optional(),
	tags: z.array(z.string().trim().min(1)).max(20).optional(),
});

export const tagQuerySchema = z.object({
	q: z.string().trim().max(100).optional(),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const tagNewsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const relatedNewsSchema = z.object({
	params: z.object({
		id: z.string().min(1, 'O ID ou slug da notícia é obrigatório'),
	}),
	query: z.object({
		limit: z.coerce.number().int().min(1).max(50).default(6),
	}),
});
