import { z } from 'zod';

const QUERY_MAX_LENGTH = 200;
export const SORT_FIELDS = ['published_at', 'title', 'source'] as const;
export type SortField = (typeof SORT_FIELDS)[number];

function firstValue(value: unknown): unknown {
	if (Array.isArray(value)) {
		return firstValue(value[0]);
	}

	return value;
}

function normalizeText(value: unknown, maxLength?: number): unknown {
	const scalar = firstValue(value);
	if (typeof scalar !== 'string' && typeof scalar !== 'number') {
		return undefined;
	}

	const normalized = String(scalar).trim().replace(/\s+/g, ' ');
	if (!normalized) {
		return undefined;
	}

	return maxLength ? normalized.slice(0, maxLength) : normalized;
}

function normalizeNumber(value: unknown, fallbackLimit?: number): unknown {
	const scalar = firstValue(value);
	const parsed = typeof scalar === 'number' ? scalar : Number(scalar);

	if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 1) {
		return undefined;
	}

	if (fallbackLimit !== undefined) {
		return Math.min(parsed, fallbackLimit);
	}

	return parsed;
}

const optionalText = (maxLength?: number) =>
	z.preprocess((value) => normalizeText(value, maxLength), z.string().optional()).catch(undefined);

export const queryOptionsSchema = z
	.object({
		id: z
			.preprocess((value) => normalizeText(value), z.uuid().optional())
			.catch(undefined),
		email: z
			.preprocess(
				(value) => {
					const normalized = normalizeText(value);
					return typeof normalized === 'string' ? normalized.toLowerCase() : undefined;
				},
				z.email().optional(),
			)
			.catch(undefined),
		page: z
			.preprocess((value) => normalizeNumber(value), z.number().int().min(1).optional())
			.default(1),
		limit: z
			.preprocess((value) => normalizeNumber(value, 100), z.number().int().min(1).max(100).optional())
			.default(10),
		query: optionalText(QUERY_MAX_LENGTH),
		category: optionalText(),
		sortBy: z.preprocess(
			(value) => normalizeText(value),
			z.enum(SORT_FIELDS).optional(),
		).catch(undefined),
		order: z
			.preprocess(
				(value) => {
					const normalized = normalizeText(value);
					return typeof normalized === 'string' ? normalized.toLowerCase() : undefined;
				},
				z.enum(['asc', 'desc']).optional(),
			)
			.default('desc')
			.catch('desc'),
	})
	.strip();
