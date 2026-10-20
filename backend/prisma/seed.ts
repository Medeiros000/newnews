import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is required to run the seed");
}

const adapter = new PrismaBetterSqlite3({
	url: databaseUrl,
	timeout: 10_000,
});
const prisma = new PrismaClient({ adapter });

const users = [
	{
		email: "test@newnews.com",
		name: "Test News",
	}
];

const categories = [
	{
		id: "c1111111-1111-1111-1111-111111111111",
		label: "Esportes",
		icon: "sports",
	},
	{
		id: "c2222222-2222-2222-2222-222222222222",
		label: "Tecnologia",
		icon: "U+1F4BB",
	},
];

try {
	for (const user of users) {
		await prisma.user.upsert({
			where: { email: user.email },
			update: { name: user.name },
			create: user,
		});
	}

	for (const category of categories) {
		await prisma.category.upsert({
			where: { id: category.id },
			update: category,
			create: category,
		});
	}

	console.log(`Seed concluído: ${users.length} usuários e ${categories.length} categorias processados.`);
} finally {
	await prisma.$disconnect();
}
