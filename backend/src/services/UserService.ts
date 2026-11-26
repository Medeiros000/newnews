import bcrypt from 'bcryptjs';
import { PrismaService } from './PrismaService.js';
import { NewsMapper } from '../mappers/NewsMapper.js';

export class UserService {
  public constructor(private readonly prisma: PrismaService = PrismaService.getInstance()) {}

  public async updateProfile(userId: string, data: { name?: string; bio?: string | null; avatarUrl?: string | null }) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      },
      include: { preferences: true },
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      bio: updated.bio,
      avatarUrl: updated.avatarUrl,
      preferences: updated.preferences,
    };
  }

  public async updatePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValid) {
      throw new Error('Senha atual incorreta.');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return true;
  }

  public async updatePreferences(
    userId: string,
    data: {
      theme: string;
      emailNotifications: boolean;
      newsletter: boolean;
      favoriteCategories: string[];
    },
  ) {
    const updated = await this.prisma.userPreference.upsert({
      where: { userId },
      update: {
        theme: data.theme,
        emailNotifications: data.emailNotifications,
        newsletter: data.newsletter,
        favoriteCategories: data.favoriteCategories,
      },
      create: {
        userId,
        theme: data.theme,
        emailNotifications: data.emailNotifications,
        newsletter: data.newsletter,
        favoriteCategories: data.favoriteCategories,
      },
    });

    return updated;
  }

  public async getBookmarks(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        news: {
          include: {
            category: true,
            tags: true,
          },
        },
      },
    });

    return bookmarks.map((b) => ({
      id: b.id,
      createdAt: b.createdAt,
      news: NewsMapper.fromPrisma(b.news as any),
    }));
  }

  public async toggleBookmark(userId: string, newsId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: {
        userId_newsId: { userId, newsId },
      },
    });

    if (existing) {
      await this.prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return { bookmarked: false };
    }

    await this.prisma.bookmark.create({
      data: { userId, newsId },
    });
    return { bookmarked: true };
  }

  public async getHistory(userId: string) {
    const history = await this.prisma.readingHistory.findMany({
      where: { userId },
      orderBy: { viewedAt: 'desc' },
      take: 50,
      include: {
        news: {
          include: {
            category: true,
            tags: true,
          },
        },
      },
    });

    return history.map((h) => ({
      id: h.id,
      viewedAt: h.viewedAt,
      news: NewsMapper.fromPrisma(h.news as any),
    }));
  }

  public async recordReadingHistory(userId: string, newsId: string) {
    await this.prisma.readingHistory.create({
      data: { userId, newsId },
    });
  }
}
