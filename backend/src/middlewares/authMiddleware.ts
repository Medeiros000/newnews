import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, type TokenPayload } from '../utils/jwt.js';

export interface AuthenticatedUser extends TokenPayload {}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    response.status(401).json({
      success: false,
      error: 'Token de autenticação não fornecido.',
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    response.status(401).json({
      success: false,
      error: 'Formato do cabeçalho de autorização inválido. Use "Bearer <token>".',
    });
    return;
  }

  const token = parts[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    response.status(401).json({
      success: false,
      error: 'Token inválido ou expirado.',
    });
    return;
  }

  request.user = payload;
  next();
}

export function ensureAdmin(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  if (!request.user) {
    response.status(401).json({
      success: false,
      error: 'Autenticação necessária para prosseguir.',
    });
    return;
  }

  if (request.user.role !== 'ADMIN') {
    response.status(403).json({
      success: false,
      error: 'Acesso negado: permissão de Administrador necessária.',
    });
    return;
  }

  next();
}
