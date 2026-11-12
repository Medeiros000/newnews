import { describe, expect, it } from '@jest/globals';
import { QueryOptions } from '../../src/queries/QueryOptions.js';

describe('QueryOptions', () => {
	it('normaliza e aplica limites aos parâmetros', () => {
		const options = new QueryOptions({
			page: '3',
			limit: '150',
			query: '  notícias   recentes  ',
			category: '  tecnologia  ',
			email: ' USER@EXAMPLE.COM ',
			id: '550e8400-e29b-41d4-a716-446655440000',
			sortBy: ' title ',
			order: 'ASC',
		});

		expect(options).toEqual({
			id: '550e8400-e29b-41d4-a716-446655440000',
			email: 'user@example.com',
			page: 3,
			limit: 100,
			query: 'notícias recentes',
			category: 'tecnologia',
			sortBy: 'title',
			order: 'asc',
		});
	});

	it('usa valores seguros e ignora valores inválidos ou desconhecidos', () => {
		const options = new QueryOptions({
			page: '-1',
			limit: 'infinity',
			query: '   ',
			category: '  ',
			email: 'invalid',
			id: 'invalid',
			sortBy: 'category_id',
			order: 'invalid',
			unknown: 'ignored',
		});

		expect(options.page).toBe(1);
		expect(options.limit).toBe(10);
		expect(options.query).toBeUndefined();
		expect(options.category).toBeUndefined();
		expect(options.email).toBeUndefined();
		expect(options.id).toBeUndefined();
		expect(options.sortBy).toBeUndefined();
		expect(options.order).toBe('desc');
		expect(Object.keys(options)).not.toContain('unknown');
		expect(Object.isFrozen(options)).toBe(true);
	});
});
