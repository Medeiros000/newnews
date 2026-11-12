import { queryOptionsSchema, type SortField } from './queryOptionsSchema.js';

export class QueryOptions {
	public readonly id?: string;
	public readonly email?: string;
	public readonly page: number;
	public readonly limit: number;
	public readonly query?: string;
	public readonly category?: string;
	public readonly sortBy?: SortField;
	public readonly order: 'asc' | 'desc';

	constructor(data?: unknown) {
		const options = queryOptionsSchema.parse(data ?? {});

		this.id = options.id;
		this.email = options.email;
		this.page = options.page;
		this.limit = options.limit;
		this.query = options.query;
		this.category = options.category;
		this.sortBy = options.sortBy;
		this.order = options.order;

		Object.freeze(this);
	}
}
