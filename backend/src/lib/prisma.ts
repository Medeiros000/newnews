import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, type Prisma } from "../../generated/prisma/client.js";

export interface PrismaServiceOptions {
    databaseUrl: string;
    timeout?: number;
    prismaOptions?: Prisma.PrismaClientBaseOptions;
}

export class PrismaService extends PrismaClient {
    constructor(config: string | PrismaServiceOptions) {
        const options: PrismaServiceOptions =
            typeof config === "string" ? { databaseUrl: config } : config;

        const adapter = new PrismaBetterSqlite3({
            url: options.databaseUrl,
            timeout: options.timeout ?? 10_000,
        });

        super({
            ...options.prismaOptions,
            adapter,
        });
    }
}

