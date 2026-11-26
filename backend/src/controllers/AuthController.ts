import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../schemas/userValidation.js';

export class AuthController {
  public constructor(private readonly authService: AuthService = new AuthService()) {}

  public async register(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const data = registerSchema.parse(request.body);
      const result = await this.authService.register(data);
      response.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'E-mail já cadastrado no sistema.') {
        response.status(409).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  public async login(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const data = loginSchema.parse(request.body);
      const result = await this.authService.login(data);
      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (
        error.message === 'Credenciais inválidas.' ||
        error.message === 'Credenciais inválidas ou conta inativa.'
      ) {
        response.status(401).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  public async refresh(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const data = refreshTokenSchema.parse(request.body);
      const result = await this.authService.refresh(data.refreshToken);
      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      response.status(401).json({ success: false, error: error.message || 'Token inválido' });
    }
  }

  public async logout(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      if (request.user?.userId) {
        await this.authService.logout(request.user.userId);
      }
      response.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  }

  public async me(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      if (!request.user?.userId) {
        response.status(401).json({ success: false, error: 'Não autenticado' });
        return;
      }

      const me = await this.authService.getMe(request.user.userId);
      if (!me) {
        response.status(404).json({ success: false, error: 'Usuário não encontrado' });
        return;
      }

      response.status(200).json({
        success: true,
        data: me,
      });
    } catch (error) {
      next(error);
    }
  }
}
