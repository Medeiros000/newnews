import { PrismaService } from './PrismaService.js';
import type { CacheProvider } from './cache/CacheProvider.js';
import { getSharedCacheProvider } from './cache/createCacheProvider.js';
import { Role, NewsStatus } from '../../generated/prisma/client.js';

export class AdminService {
  public constructor(
    private readonly prisma: PrismaService = PrismaService.getInstance(),
    private readonly cache: CacheProvider = getSharedCacheProvider(),
  ) {}

  public async getStats() {
    const [
      totalUsers,
      totalNews,
      publishedNews,
      draftNews,
      archivedNews,
      totalCategories,
      totalTags,
      viewsAggregate,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.news.count(),
      this.prisma.news.count({ where: { status: NewsStatus.PUBLISHED } }),
      this.prisma.news.count({ where: { status: NewsStatus.DRAFT } }),
      this.prisma.news.count({ where: { status: NewsStatus.ARCHIVED } }),
      this.prisma.category.count(),
      this.prisma.tag.count(),
      this.prisma.news.aggregate({ _sum: { viewsCount: true } }),
    ]);

    return {
      users: {
        total: totalUsers,
      },
      news: {
        total: totalNews,
        published: publishedNews,
        draft: draftNews,
        archived: archivedNews,
        totalViews: viewsAggregate._sum.viewsCount || 0,
      },
      categories: {
        total: totalCategories,
      },
      tags: {
        total: totalTags,
      },
    };
  }

  public async getUsers(query?: string, limit = 50, page = 1) {
    const where = query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              newsAuthored: true,
              bookmarks: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async updateUser(userId: string, data: { name?: string; role?: 'USER' | 'ADMIN'; isActive?: boolean }) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role as Role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return updated;
  }

  public async deleteUser(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    return true;
  }
}
