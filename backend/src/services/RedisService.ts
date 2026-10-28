import { Redis, type RedisOptions } from 'ioredis';
import { env } from '../config/env.js';
import { Logger } from '../utils/Logger.js';

export class RedisService {
  private static instance: RedisService | undefined;
  private readonly logger = new Logger('RedisService');
  private readonly client: Redis;

  private constructor(
    private readonly url: string = env.REDIS_URL,
    options?: RedisOptions,
  ) {
    this.client = new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times: number): number => Math.min(times * 100, 3000),
      ...options,
    });

    this.client.on('error', (error: Error) => {
      this.logger.warn(`Conexão com Redis indisponível: ${error.message}`);
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }

    return RedisService.instance;
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
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error: any) {
      this.logger.debug(`Falha não bloqueante ao salvar no Redis (${key}):`, error?.message);
    }
  }

  public async del(key: string | string[]): Promise<void> {
    try {
      const keys = Array.isArray(key) ? key : [key];
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error: any) {
      this.logger.debug('Falha não bloqueante ao deletar chaves no Redis:', error?.message);
    }
  }

  public async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error: any) {
      this.logger.debug(
        `Falha não bloqueante ao deletar por padrão (${pattern}) no Redis:`,
        error?.message,
      );
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error: any) {
      this.logger.debug('Falha ao desconectar do Redis:', error?.message);
    }
  }
}
