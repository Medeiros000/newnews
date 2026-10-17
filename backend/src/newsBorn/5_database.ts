
import { prisma } from '../lib/prisma.js';
import { NewsItemInput } from './3_validator.js';

export async function saveNewsToDatabase(newsItem: NewsItemInput) {
  let shouldBeHero = newsItem.isHero;

  if (shouldBeHero) {
    // Calcula a data de 24 horas atrás
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Procura se já existe um destaque ativo nas últimas 24 horas
    const activeHero = await prisma.news.findFirst({
      where: {
        isHero: true,
        createdAt: { gte: twentyFourHoursAgo },
      },
    });

    // Se já tem um destaque recente válido, esta nova notícia NÃO pode ser hero
    if (activeHero) {
      shouldBeHero = false;
    } else {
      // Se o destaque antigo expirou, removemos o status hero dos antigos para garantir apenas um ativo
      await prisma.news.updateMany({
        where: { isHero: true },
        data: { isHero: false },
      });
    }
  }

  return await prisma.news.create({
    data: {
      category_id: newsItem.category_id,
      badgeBg: newsItem.badgeBg,
      title: newsItem.title,
      summary: newsItem.summary,
      content: newsItem.content,
      image_url: newsItem.image_url,
      publishedAt: new Date(newsItem.publishedAt),
      author: newsItem.author,
      source: newsItem.source,
      isHero: shouldBeHero,
    },
  });
}