import type { QueryOptions } from '../../commands/QueryOptions.js';
import type { User } from '../../models/entities/User.js';

export interface IUserService {
    getUser(queryOptions: QueryOptions): Promise<User | null>;
}
