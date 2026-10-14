import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client.js";

export class PrismaService extends PrismaClient {
    constructor(databaseUrl: string) {
        const adapter = new PrismaBetterSqlite3({
            url: databaseUrl,
            timeout: 10_000,
        });
        super({ adapter });
    }
}
