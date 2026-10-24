import { User } from '../models/entities/User.js';
import type { User as PrismaUser } from '../../generated/prisma/client.js';

export class UserMapper {
    static fromPrisma(user: PrismaUser): User {
        return new User(
            user.id,
            user.email, user.name, user.avatar);
    }
}