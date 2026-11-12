import type { CacheProvider } from './CacheProvider.js';

export class NullCacheProvider implements CacheProvider {
	public async get<T>(_key: string): Promise<T | null> {
		return null;
	}

	public async set(
		_key: string,
		_value: unknown,
		_ttlSeconds?: number,
	): Promise<void> {}

	public async del(_key: string | string[]): Promise<void> {}

	public async delByPattern(_pattern: string): Promise<void> {}
}
