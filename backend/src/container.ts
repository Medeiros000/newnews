import { PrismaService } from './services/PrismaService.js';
import { createCacheProvider } from './services/cache/createCacheProvider.js';

export const prisma = PrismaService.getInstance();
export const cache = createCacheProvider();
