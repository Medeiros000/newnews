import { Redis, type RedisOptions } from 'ioredis';
import type { CacheProvider } from './CacheProvider.js';

const DEFAULT_TTL_SECONDS = 300;
const SCAN_COUNT = 100;

export class RedisCacheProvider implements CacheProvider {
	private readonly client: Redis;

	public constructor(
		private readonly url: string,
		options?: RedisOptions,
	) {
		this.client = new Redis(url, {
			lazyConnect: true,
			maxRetriesPerRequest: 1,
			retryStrategy: (times: number): number => Math.min(times * 100, 3000),
			...options,
		});

		this.client.on('error', (error: Error) => {
			console.warn(`Redis indisponível: ${error.message}`);
		});
	}

	public async get<T>(key: string): Promise<T | null> {
		try {
			const raw = await this.client.get(key);
			if (raw === null) {
				return null;
			}

			try {
				return JSON.parse(raw) as T;
			} catch (error) {
				console.warn(`Falha ao desserializar cache (${key}):`, this.errorMessage(error));
				return null;
			}
		} catch (error) {
			console.warn(`Falha não bloqueante ao ler cache (${key}):`, this.errorMessage(error));
			return null;
		}
	}

	public async set(
		key: string,
		value: unknown,
		ttlSeconds: number = DEFAULT_TTL_SECONDS,
	): Promise<void> {
		let serialized: string;
		try {
			serialized = JSON.stringify(value);
		} catch (error) {
			console.warn(`Falha ao serializar cache (${key}):`, this.errorMessage(error));
			return;
		}

		try {
			await this.client.set(key, serialized, 'EX', ttlSeconds);
		} catch (error) {
			console.warn(`Falha não bloqueante ao salvar cache (${key}):`, this.errorMessage(error));
		}
	}

	public async del(key: string | string[]): Promise<void> {
		const keys = Array.isArray(key) ? key : [key];
		if (keys.length === 0) {
			return;
		}

		try {
			await this.client.del(...keys);
		} catch (error) {
			console.warn('Falha não bloqueante ao deletar cache:', this.errorMessage(error));
		}
	}

	public async delByPattern(pattern: string): Promise<void> {
		try {
			let cursor = '0';
			do {
				const [nextCursor, keys] = await this.client.scan(
					cursor,
					'MATCH',
					pattern,
					'COUNT',
					SCAN_COUNT,
				);
				cursor = nextCursor;
				if (keys.length > 0) {
					await this.client.del(...keys);
				}
			} while (cursor !== '0');
		} catch (error) {
			console.warn(
				`Falha não bloqueante ao deletar cache por padrão (${pattern}):`,
				this.errorMessage(error),
			);
		}
	}

	public async tryAcquireLock(key: string, token: string, ttlSeconds: number): Promise<boolean> {
		try {
			const result = await this.client.set(key, token, 'EX', ttlSeconds, 'NX');
			return result === 'OK';
		} catch (error) {
			console.warn(
				`Falha não bloqueante ao adquirir lock (${key}); seguindo sem lock:`,
				this.errorMessage(error),
			);
			return true;
		}
	}

	public async releaseLock(key: string, token: string): Promise<void> {
		try {
			await this.client.eval(
				`if redis.call("get", KEYS[1]) == ARGV[1] then
					return redis.call("del", KEYS[1])
				end
				return 0`,
				1,
				key,
				token,
			);
		} catch (error) {
			console.warn(`Falha não bloqueante ao liberar lock (${key}):`, this.errorMessage(error));
		}
	}

	public async disconnect(): Promise<void> {
		try {
			await this.client.quit();
		} catch (error) {
			console.warn('Falha não bloqueante ao desconectar Redis:', this.errorMessage(error));
		}
	}

	private errorMessage(error: unknown): string {
		return error instanceof Error ? error.message : String(error);
	}
}
