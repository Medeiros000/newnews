import { Redis } from "ioredis";

export class RedisService {
    private client: Redis;

    constructor(redisUrl: string) {
        this.client = new Redis(redisUrl, {
            lazyConnect: true,
            maxRetriesPerRequest: 1,
            retryStrategy: (times) => Math.min(times * 100, 3000),
        });

        this.client.on("error", () => {
            // Suppress unhandled errors so process won't crash if Redis is unavailable
        });
    }

    public async get<T>(key: string): Promise<T | null> {
        try {
            const raw = await this.client.get(key);
            if (!raw) return null;
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    }

    public async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
        try {
            await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
        } catch {
            // Cache failures are non-blocking
        }
    }
}