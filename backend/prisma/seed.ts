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
		email: "ana.silva@newnews.com",
		name: "Ana Silva",
	},
	{
		email: "bruno.santos@newnews.com",
		name: "Bruno Santos",
	},
	{
		email: "carla.oliveira@newnews.com",
		name: "Carla Oliveira",
	},
];

const newsMocks = [
	{
		id: "11111111-1111-1111-1111-111111111111",
		category_id: "c1111111-1111-1111-1111-111111111111",
		badge_bg: "success",
		title:
			"Seleção Brasileira confirma convocação para as Eliminatórias com novos talentos da base",
		summary:
			"Com surpresas na lista, o técnico anuncia chamados inéditos vindos das categorias de base, prometendo renovar o estilo de jogo da equipe canarinha nas próximas rodadas das Eliminatórias da Copa do Mundo.",
		content:
			"Com surpresas na lista, o técnico anuncia chamados inéditos vindos das categorias de base, prometendo renovar o estilo de jogo da equipe canarinha nas próximas rodadas das Eliminatórias da Copa do Mundo. De acordo com especialistas da área, os recentes acontecimentos representam um marco importante e abrem espaço para novas discussões no setor. As partes envolvidas continuam monitorando o cenário de perto para implementar os ajustes necessários de maneira ágil e eficiente.",
		image_url:
			"https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=800&h=450&fit=crop&auto=format",
		published_at: new Date(Date.now() - 12 * 60 * 1000),
		author: "Redação Esportes",
		source: "Portal New News",
	},
	{
		id: "22222222-2222-2222-2222-222222222222",
		category_id: "c2222222-2222-2222-2222-222222222222",
		badge_bg: "primary",
		title: "Nova IA promete revolucionar a forma como trabalhamos",
		summary:
			"Modelo de linguagem da OpenAI apresenta capacidade de raciocínio avançado e execução de tarefas complexas de forma autônoma.",
		content:
			"Modelo de linguagem da OpenAI apresenta capacidade de raciocínio avançado e execução de tarefas complexas de forma autônoma. De acordo com especialistas da área, os recentes acontecimentos representam um marco importante e abrem espaço para novas discussões no setor. As partes envolvidas continuam monitorando o cenário de perto para implementar os ajustes necessários de maneira ágil e eficiente.",
		image_url:
			"https://images.unsplash.com/photo-1674027444485-cec3da58eef4?w=480&h=260&fit=crop&auto=format",
		published_at: new Date(Date.now() - 60 * 60 * 1000),
		author: "Tecnologia & Inovação",
		source: "Tech Trends",
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

	for (const news of newsMocks) {
		await prisma.news.upsert({
			where: { id: news.id },
			update: news,
			create: news,
		});
	}

	console.log(`Seed concluído: ${users.length} usuários e ${newsMocks.length} notícias processados.`);
} finally {
	await prisma.$disconnect();
}
