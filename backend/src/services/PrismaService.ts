import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../../generated/prisma/client.js';
import { env } from '../config/env.js';

export class PrismaService extends PrismaClient {
	private static instance: PrismaService | undefined;
	private constructor(private readonly url: string = env.DATABASE_URL) {
		super({
			adapter: new PrismaBetterSqlite3({
				url: url,
				timeout: 10_000,
			}),
		});
	}

	public static getInstance(): PrismaService {
		if (!PrismaService.instance) {
			PrismaService.instance = new PrismaService();
		}

		return PrismaService.instance;
	}
}
