import bcrypt from 'bcryptjs';
import { PrismaService } from './PrismaService.js';
import type { CacheProvider } from './cache/CacheProvider.js';
import { getSharedCacheProvider } from './cache/createCacheProvider.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';

export class AuthService {
  public constructor(
    private readonly prisma: PrismaService = PrismaService.getInstance(),
    private readonly cache: CacheProvider = getSharedCacheProvider(),
  ) {}

  public async register(data: { name: string; email: string; password: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('E-mail já cadastrado no sistema.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        preferences: {
          create: {
            theme: 'system',
            emailNotifications: true,
            newsletter: false,
            favoriteCategories: [],
          },
        },
      },
      include: {
        preferences: true,
      },
    });

    const tokenPayload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Salva refresh token no redis
    await this.cache.set(`user:refresh:${user.id}`, refreshToken, 7 * 24 * 3600);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        preferences: user.preferences,
      },
      accessToken,
      refreshToken,
    };
  }

  public async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: {
        preferences: true,
      },
    });

    if (!user || !user.isActive) {
      throw new Error('Credenciais inválidas ou conta inativa.');
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      throw new Error('Credenciais inválidas.');
    }

    const tokenPayload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await this.cache.set(`user:refresh:${user.id}`, refreshToken, 7 * 24 * 3600);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        preferences: user.preferences,
      },
      accessToken,
      refreshToken,
    };
  }

  public async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Refresh token inválido ou expirado.');
    }

    const cachedToken = await this.cache.get<string>(`user:refresh:${payload.userId}`);
    if (!cachedToken || cachedToken !== refreshToken) {
      throw new Error('Refresh token revogado ou inválido.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      include: { preferences: true },
    });

    if (!user || !user.isActive) {
      throw new Error('Usuário inexistente ou inativo.');
    }

    const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user.id, role: user.role });

    await this.cache.set(`user:refresh:${user.id}`, newRefreshToken, 7 * 24 * 3600);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async logout(userId: string) {
    await this.cache.del(`user:refresh:${userId}`);
    return true;
  }

  public async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      preferences: user.preferences,
      createdAt: user.createdAt,
    };
  }
}
