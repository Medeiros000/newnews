import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client.js';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run the seed');
}

const adapter = new PrismaBetterSqlite3({
    url: databaseUrl,
    timeout: 10_000,
});
const prisma = new PrismaClient({ adapter });

const users = [
    {
        email: 'test@newnews.com',
        name: 'Test News',
    },
];

const categories = [
    {
        name: 'general',
        label: 'Geral',
        icon: 'U+1F4F0',
    },
    {
        name: 'entertainment',
        label: 'Entretenimento',
        icon: 'U+1F3A8',
    },
    {
        name: 'society',
        label: 'Sociedade',
        icon: 'U+1F3E0',
    },
    {
        name: 'science_technology',
        label: 'Ciência e Tecnologia',
        icon: 'U+1F4BB',
    },
    {
        label: 'Política e Governo',
        name: 'politics_government',
        icon: 'U+1F3E0',
    },
    {
        label: 'Economia, Negócios e Finanças',
        name: 'economy_business_finance',
        icon: 'U+1F4B0',
    },
    {
        label: 'Artes, Cultura e Entretenimento',
        name: 'arts_culture_entertainment',
        icon: 'U+1F3A8',
    },
    {
        label: 'Estilo de Vida e Lazer',
        name: 'lifestyle_leisure',
        icon: 'U+1F3E0',
    },
    {
        label: 'Interesse Humano',
        name: 'human_interest',
        icon: 'U+1F4AA',
    },
    {
        label: 'Esportes',
        name: 'sport',
        icon: 'U+1F3C0',
    },
    {
        label: 'Crime, Lei e Justiça',
        name: 'crime_law_justice',
        icon: 'U+1F6E1',
    },
    {
        label: 'Educação',
        name: 'education',
        icon: 'U+1F393',
    },
    {
        label: 'Saúde e Medicina',
        name: 'health_medicine',
        icon: 'U+1F489',
    },
    {
        label: 'Meio Ambiente e Sustentabilidade',
        name: 'environment_sustainability',
        icon: 'U+1F331',
    },
    {
        label: 'Viagem e Turismo',
        name: 'travel_tourism',
        icon: 'U+1F5FA',
    },
    {
        label: 'Cultura e Lazer',
        name: 'culture_leisure',
        icon: 'U+1F3A8',
    },
    {
        label: 'Programação',
        name: 'programming',
        icon: 'U+1F4BB',
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
            where: { name: category.name },
            update: {
                label: category.label,
                icon: category.icon,
            },
            create: category,
        });
    }

    console.log(
        `Seed concluído: ${users.length} usuários e ${categories.length} categorias processados.`,
    );
} finally {
    await prisma.$disconnect();
}
