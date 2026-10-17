// src/controllers/newsController.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const newsController = {
  async getRelated(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { limit } = req.query; // Já transformado em número pelo Zod

      const currentNews = await prisma.news.findUnique({
        where: { id },
        select: { id: true, categoryId: true }, 
      });

      if (!currentNews) {
        return res.status(404).json({ message: 'Notícia não encontrada.' });
      }

      // 2. Busca as notícias relacionadas
      const relatedNews = await prisma.news.findMany({
        where: {
          categoryId: currentNews.categoryId, // Mesma categoria da principal
          id: { not: currentNews.id },        // Exclui a notícia de origem dos resultados
        },
        take: Number(limit) || 4,             // Limita a quantidade (padrão 4)
        orderBy: {
          createdAt: 'desc',                  // Opcional: pega as mais recentes daquela categoria
        },
        select: {
          id: true,
          title: true,
          imageUrl: true,                     // Imagem para aparecer o card na lateral
          createdAt: true,
        },
      });

      // Se não achar nada, o Prisma já retorna array vazio [], o que atende ao requisito!
      return res.status(200).json(relatedNews);
    } catch (error) {
      // Encaminha falhas ao middleware de erro global do Express
      return res.status(500).json({ message: 'Erro ao buscar notícias relacionadas.', error });
    }
  },
};