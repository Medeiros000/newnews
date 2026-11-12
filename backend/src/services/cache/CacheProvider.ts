export interface CacheProvider {
	get<T>(key: string): Promise<T | null>;
	set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
	del(key: string | string[]): Promise<void>;
	delByPattern(pattern: string): Promise<void>;
}
