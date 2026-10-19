import { PrismaService } from './lib/prisma.js';
import { RedisService } from './lib/redis.js';
import { env } from './config/env.js';

export const prisma = new PrismaService(env.DATABASE_URL);
export const cache = new RedisService(env.REDIS_URL);
