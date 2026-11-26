import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient, Role, NewsStatus } from '../generated/prisma/client.js';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to run the seed');
}

const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = [
    { name: 'general', label: 'Geral', icon: '📰' },
    { name: 'entertainment', label: 'Entretenimento', icon: '🎨' },
    { name: 'society', label: 'Sociedade', icon: '🏛️' },
    { name: 'science_technology', label: 'Tecnologia', icon: '💻' },
    { name: 'politics_government', label: 'Política e Governo', icon: '⚖️' },
    { name: 'economy_business_finance', label: 'Finanças & Negócios', icon: '💰' },
    { name: 'sport', label: 'Esportes', icon: '⚽' },
    { name: 'health_medicine', label: 'Saúde', icon: '💉' },
    { name: 'environment_sustainability', label: 'Meio Ambiente', icon: '🌱' },
];

const tags = [
    { name: 'Inteligência Artificial', slug: 'inteligencia-artificial' },
    { name: 'Startups', slug: 'startups' },
    { name: 'Mercado Financeiro', slug: 'mercado-financeiro' },
    { name: 'Inovação', slug: 'inovacao' },
    { name: 'Cibersegurança', slug: 'ciberseguranca' },
    { name: 'Brasil', slug: 'brasil' },
    { name: 'Mundo', slug: 'mundo' },
    { name: 'Ciência', slug: 'ciencia' },
];

async function main() {
    console.log('🌱 Iniciando seed do banco de dados NewsHub...');

    // 1. Criar Categorias
    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: { label: category.label, icon: category.icon },
            create: category,
        });
    }
    console.log(`✅ ${categories.length} categorias cadastradas/atualizadas.`);

    // 2. Criar Tags
    for (const tag of tags) {
        await prisma.tag.upsert({
            where: { slug: tag.slug },
            update: { name: tag.name },
            create: tag,
        });
    }
    console.log(`✅ ${tags.length} tags cadastradas/atualizadas.`);

    // 3. Criar Usuários: ADMIN e USER padrão
    const hashedPassword = await bcrypt.hash('SenhaForte123!', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@newshub.com' },
        update: {
            role: Role.ADMIN,
            isActive: true,
            name: 'Administrador NewsHub',
        },
        create: {
            name: 'Administrador NewsHub',
            email: 'admin@newshub.com',
            password: hashedPassword,
            role: Role.ADMIN,
            isActive: true,
            bio: 'Editor-chefe e Administrador geral do portal NewsHub.',
            preferences: {
                create: {
                    theme: 'dark',
                    emailNotifications: true,
                    newsletter: true,
                    favoriteCategories: ['science_technology', 'economy_business_finance'],
                },
            },
        },
    });

    const standardUser = await prisma.user.upsert({
        where: { email: 'leitor@newshub.com' },
        update: {
            role: Role.USER,
            isActive: true,
            name: 'Leitor NewsHub',
        },
        create: {
            name: 'Leitor NewsHub',
            email: 'leitor@newshub.com',
            password: hashedPassword,
            role: Role.USER,
            isActive: true,
            bio: 'Entusiasta de tecnologia e finanças.',
            preferences: {
                create: {
                    theme: 'system',
                    emailNotifications: true,
                    newsletter: false,
                    favoriteCategories: ['science_technology', 'general'],
                },
            },
        },
    });

    console.log(`✅ Usuários criados:`);
    console.log(`   - ADMIN: admin@newshub.com (Senha: SenhaForte123!)`);
    console.log(`   - USER : leitor@newshub.com (Senha: SenhaForte123!)`);

    // 4. Cadastrar Notícias Iniciais
    const techCategory = await prisma.category.findUnique({ where: { name: 'science_technology' } });
    const economyCategory = await prisma.category.findUnique({ where: { name: 'economy_business_finance' } });

    if (techCategory && economyCategory) {
        const initialArticles = [
            {
                title: 'A Nova Fronteira da Inteligência Artificial em 2026',
                slug: 'a-nova-fronteira-da-inteligencia-artificial-em-2026',
                description: 'Avanços em modelos autônomos e computação em borda aceleram a produtividade global.',
                url: 'https://newshub.com/tech/ia-2026-avancos',
                author: 'Equipe de Tecnologia',
                imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
                language: 'pt-BR',
                source: 'NewsHub Tech',
                status: NewsStatus.PUBLISHED,
                viewsCount: 1420,
                categoryId: techCategory.id,
                authorId: adminUser.id,
                publishedAt: new Date(),
                tags: {
                    connect: [
                        { slug: 'inteligencia-artificial' },
                        { slug: 'inovacao' },
                        { slug: 'ciencia' },
                    ],
                },
            },
            {
                title: 'Mercados Financeiros: Inovação e Sustentabilidade Lideram Projeções',
                slug: 'mercados-financeiros-inovacao-e-sustentabilidade-lideram-projecoes',
                description: 'Investimentos em energias renováveis e inteligência de dados transformam os índices econômicos mundiais.',
                url: 'https://newshub.com/economy/mercados-financeiros-2026',
                author: 'Redação de Economia',
                imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
                language: 'pt-BR',
                source: 'NewsHub Finance',
                status: NewsStatus.PUBLISHED,
                viewsCount: 980,
                categoryId: economyCategory.id,
                authorId: adminUser.id,
                publishedAt: new Date(Date.now() - 3600 * 1000 * 4),
                tags: {
                    connect: [
                        { slug: 'mercado-financeiro' },
                        { slug: 'startups' },
                        { slug: 'brasil' },
                    ],
                },
            },
            {
                title: 'Cibersegurança e Proteção de Dados: O Que Muda para as Empresas',
                slug: 'ciberseguranca-e-protecao-de-dados-o-que-muda-para-as-empresas',
                description: 'Novas regulamentações e adoção de criptografia quântica passam a ser exigidas pelo mercado.',
                url: 'https://newshub.com/tech/ciberseguranca-novas-regras',
                author: 'Ana Ribeiro',
                imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
                language: 'pt-BR',
                source: 'NewsHub Tech',
                status: NewsStatus.PUBLISHED,
                viewsCount: 750,
                categoryId: techCategory.id,
                authorId: adminUser.id,
                publishedAt: new Date(Date.now() - 3600 * 1000 * 12),
                tags: {
                    connect: [
                        { slug: 'ciberseguranca' },
                        { slug: 'inovacao' },
                    ],
                },
            },
        ];

        for (const item of initialArticles) {
            await prisma.news.upsert({
                where: { url: item.url },
                update: {
                    title: item.title,
                    slug: item.slug,
                    description: item.description,
                    imageUrl: item.imageUrl,
                    status: item.status,
                    viewsCount: item.viewsCount,
                    publishedAt: item.publishedAt,
                },
                create: item,
            });
        }
        console.log(`✅ ${initialArticles.length} notícias iniciais semeadas com sucesso.`);
    }

    console.log('🎉 Seed finalizado com êxito!');
}

main()
    .catch((e) => {
        console.error('❌ Erro durante execução do seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
