import { Redis, type RedisOptions } from "ioredis";

export class RedisService {
    private readonly client: Redis;

    constructor(redisUrl: string, options?: RedisOptions) {
        this.client = new Redis(redisUrl, {
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            retryStrategy: (times: number): number => Math.min(times * 100, 3000),
            ...options,
        });

        this.client.on("error", (_error: Error) => {
            // Suppress unhandled errors so process won't crash if Redis is unavailable
        });
    }

    public async get<T = unknown>(key: string): Promise<T | null> {
        try {
            const raw = await this.client.get(key);
            if (!raw) return null;
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    }

    public async set(key: string, value: unknown, ttlSeconds: number = 300): Promise<void> {
        try {
            await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
        } catch {
            // Cache failures are non-blocking
        }
    }

    public async del(key: string | string[]): Promise<void> {
        try {
            const keys = Array.isArray(key) ? key : [key];
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
        } catch {
            // Cache failures are non-blocking
        }
    }

    public async delByPattern(pattern: string): Promise<void> {
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(...keys);
            }
        } catch {
            // Cache failures are non-blocking
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await this.client.quit();
        } catch {
            // Cache failures are non-blocking
        }
    }
}