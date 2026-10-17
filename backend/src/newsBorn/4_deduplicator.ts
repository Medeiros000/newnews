
import { prisma } from '../lib/prisma.js';
import { NewsItemInput } from './3_validator.js';

export async function isDuplicate(newsItem: NewsItemInput): Promise<boolean> {
  const existingNews = await prisma.news.findFirst({
    where: {
      OR: [
        { title: newsItem.title },
        { image_url: newsItem.image_url },
      ],
    },
  });

  return existingNews !== null;
}