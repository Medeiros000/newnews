import { UserMapper } from '../mappers/UserMapper.js';
import { User } from '../models/entities/User.js';
import { QueryOptions } from '../queries/QueryOptions.js';
import { PrismaService } from './PrismaService.js';
import { RedisService } from './RedisService.js';
import { IUserService } from './interfaces/IUserService.js';

export class UserService implements IUserService {
    public constructor(
        private readonly prisma: PrismaService = PrismaService.getInstance(),
        private readonly redis: RedisService = RedisService.getInstance(),
    ) {
    }

    public async getUser(queryOptions: QueryOptions): Promise<User | null> {
        if (!queryOptions.email) {
            return null;
        }

        const cacheKey = `users:${queryOptions.email}`;
        const cachedUser = await this.redis.get<User>(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }

        const user = await this.prisma.user.findUnique({
            where: { email: queryOptions.email },
        });
        if (!user) {
            return null;
        }

        const mappedUser = UserMapper.fromPrisma(user);
        await this.redis.set(cacheKey, mappedUser, 300);
        return mappedUser;
    }
}
