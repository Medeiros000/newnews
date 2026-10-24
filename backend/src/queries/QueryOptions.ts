export class QueryOptions {
  id?: string;
  email?: string;
  page?: number;
  limit?: number;
  query?: string;
  category?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';

  constructor(data?: Partial<QueryOptions>) {
    Object.assign(this, data);
  }
}