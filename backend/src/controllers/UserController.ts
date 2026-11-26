import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService.js';
import {
  updateProfileSchema,
  updatePasswordSchema,
  updatePreferencesSchema,
} from '../schemas/userValidation.js';

export class UserController {
  public constructor(private readonly userService: UserService = new UserService()) {}

  public async updateProfile(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const userId = request.user!.userId;
      const data = updateProfileSchema.parse(request.body);
      const updated = await this.userService.updateProfile(userId, data);
      response.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  public async updatePassword(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const userId = request.user!.userId;
      const data = updatePasswordSchema.parse(request.body);
      await this.userService.updatePassword(userId, data);
      response.status(200).json({ success: true, message: 'Senha atualizada com sucesso.' });
    } catch (error: any) {
      if (error.message === 'Senha atualizada incorreta.' || error.message === 'Senha atual incorreta.') {
        response.status(400).json({ success: false, error: error.message });
        return;
      }
      next(error);
    }
  }

  public async updatePreferences(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const userId = request.user!.userId;
      const data = updatePreferencesSchema.parse(request.body);
      const updated = await this.userService.updatePreferences(userId, data);
      response.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  public async getBookmarks(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const userId = request.user!.userId;
      const bookmarks = await this.userService.getBookmarks(userId);
      response.status(200).json({ success: true, data: bookmarks });
    } catch (error) {
      next(error);
    }
  }

  public async toggleBookmark(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const userId = request.user!.userId;
      const newsId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
      const result = await this.userService.toggleBookmark(userId, newsId);
      response.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public async getHistory(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const userId = request.user!.userId;
      const history = await this.userService.getHistory(userId);
      response.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }
}
