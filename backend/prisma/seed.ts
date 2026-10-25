import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run the seed');
}

const adapter = new PrismaPg({
    connectionString: databaseUrl,
});
const prisma = new PrismaClient({ adapter });

const users = [
    {
        email: 'test@newnews.com',
        name: 'Test News',
        password: 'password123',
        avatar: 'https://example.com/avatar1.png',
    },
];

const categories = [
    {
        name: 'general',
        label: 'Geral',
        icon: 'bi bi-newspaper',
    },
    {
        name: 'entertainment',
        label: 'Entretenimento',
        icon: 'bi bi-palette',
    },
    {
        name: 'society',
        label: 'Sociedade',
        icon: 'bi bi-people',
    },
    {
        name: 'science_technology',
        label: 'Tecnologia',
        icon: 'bi bi-cpu',
    },
    {
        label: 'Política',
        name: 'politics_government',
        icon: 'bi bi-bank',
    },
    {
        label: 'Economia',
        name: 'economy_business_finance',
        icon: 'bi bi-cash-coin',
    },
    {
        label: 'Entretenimento',
        name: 'arts_culture_entertainment',
        icon: 'bi bi-mask',
    },
    {
        label: 'Lazer',
        name: 'lifestyle_leisure',
        icon: 'bi bi-cup-hot',
    },
    {
        label: 'Esportes',
        name: 'sport',
        icon: 'bi bi-trophy',
    },
    {
        label: 'Justiça',
        name: 'crime_law_justice',
        icon: 'bi bi-shield-lock',
    },
    {
        label: 'Educação',
        name: 'education',
        icon: 'bi bi-mortarboard',
    },
    {
        label: 'Saúde',
        name: 'health_medicine',
        icon: 'bi bi-heart-pulse',
    },
    {
        label: 'Meio Ambiente',
        name: 'environment_sustainability',
        icon: 'bi bi-tree',
    },
    {
        label: 'Turismo',
        name: 'travel_tourism',
        icon: 'bi bi-map',
    },
    {
        label: 'Lazer',
        name: 'culture_leisure',
        icon: 'bi bi-film',
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
