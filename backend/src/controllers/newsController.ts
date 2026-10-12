import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { getCache, setCache } from "../lib/redis.js";

const newsQuerySchema = z
    .object({
        query: z.string().trim().max(200).optional(),
        q: z.string().trim().max(200).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
    })
    .transform(({ query, q, ...pagination }) => ({
        query: query || q,
        ...pagination,
    }));

// Define the type for the response payload
type NewsListPayload = {
    type: "search" | "all";
    query: string | null;
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
    data: Awaited<ReturnType<typeof prisma.news.findMany>>;
};

async function searchNews(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const result = newsQuerySchema.safeParse(request.query);

    if (!result.success) {
        response.status(400).json({
            error: "Invalid query parameters",
            issues: result.error.issues,
        });
        return;
    }

    const { query, page, limit } = result.data;
    const where = query
        ? {
            OR: [
                { title: { contains: query } },
                { summary: { contains: query } },
                { content: { contains: query } },
            ],
        }
        : undefined;
    const cacheKey = `news:list:${encodeURIComponent(
        query?.toLowerCase() || "all"
    )}:page:${page}:limit:${limit}`;

    try {
        const cachedData = await getCache<NewsListPayload>(cacheKey);
        if (cachedData) {
            return response.status(200).json({
                source: "cache",
                ...cachedData,
            });
        }

        const [news, totalItems] = await Promise.all([
            prisma.news.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where,
                orderBy: {
                    published_at: "desc",
                },
            }),
            prisma.news.count({ where }),
        ]);

        const responsePayload: NewsListPayload = {
            type: query ? "search" : "all",
            query: query || null,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
            },
            data: news,
        };

        await setCache(cacheKey, responsePayload, 180);

        return response.status(200).json({
            source: "database",
            ...responsePayload,
        });
    } catch (error) {
        next(error);
    }
}


async function getNewsById(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
    if (!id) {
        response.status(400).json({ success: false, error: "ID inválido" });
        return;
    }

    const cacheKey = `news:${id}`;

    try {
        // 1. Check cache (Article cache hit?)
        const cachedNews = await getCache(cacheKey);
        if (cachedNews) {
            response.setHeader("X-Cache", "HIT");
            response.json({ success: true, data: cachedNews });
            return;
        }

        // 2. On cache miss, fetch from database
        const news = await prisma.news.findUnique({ where: { id } });

        if (!news) {
            response.status(404).json({ success: false, error: "Notícia não encontrada" });
            return;
        }

        // 3. Save to cache with a 5-minute TTL (300s)
        await setCache(cacheKey, news, 300);

        response.setHeader("X-Cache", "MISS");
        response.json({ success: true, data: news });
    } catch (error) {
        next(error);
    }
}

export const newsController = {
    searchNews,
    getNewsById,
};
