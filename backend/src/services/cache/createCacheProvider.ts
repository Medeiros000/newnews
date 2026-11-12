import { env } from '../../config/env.js';
import type { CacheProvider } from './CacheProvider.js';
import { NullCacheProvider } from './NullCacheProvider.js';
import { RedisCacheProvider } from './RedisCacheProvider.js';

export interface CacheConfig {
	USE_REDIS: boolean;
	REDIS_URL: string;
}

export function createCacheProvider(config: CacheConfig = env): CacheProvider {
	if (!config.USE_REDIS) {
		console.warn('Cache Redis desabilitado; usando NullCacheProvider.');
		return new NullCacheProvider();
	}

	console.warn('Cache Redis habilitado.');
	return new RedisCacheProvider(config.REDIS_URL);
}
