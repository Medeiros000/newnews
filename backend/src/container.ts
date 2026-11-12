import { PrismaService } from './lib/prisma.js';
import { createCacheProvider } from './services/cache/createCacheProvider.js';
import { env } from './config/env.js';

export const prisma = new PrismaService(env.DATABASE_URL);
export const cache = createCacheProvider();
