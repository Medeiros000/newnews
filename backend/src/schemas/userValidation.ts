import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100),
  email: z.string().trim().email('E-mail inválido').toLowerCase(),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres').max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido').toLowerCase(),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  bio: z.string().trim().max(500).optional().nullable(),
  avatarUrl: z.string().url('URL de avatar inválida').optional().nullable(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres').max(100),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  emailNotifications: z.boolean().default(true),
  newsletter: z.boolean().default(false),
  favoriteCategories: z.array(z.string()).default([]),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});
