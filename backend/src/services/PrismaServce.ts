import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../../generated/prisma/client.js';

export interface PrismaServiceOptions {
    databaseUrl: string;
    timeout?: number;
    prismaOptions?: Prisma.PrismaClientBaseOptions;
}

export class PrismaService extends PrismaClient {
    constructor(config: string | PrismaServiceOptions) {
        const options: PrismaServiceOptions =
            typeof config === 'string' ? { databaseUrl: config } : config;

        const adapter = new PrismaPg({
            connectionString: options.databaseUrl,
            max: 10,
        });

        super({
            ...options.prismaOptions,
            adapter,
        });
    }
}
