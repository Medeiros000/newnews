import type { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService.js';
import { adminUpdateUserSchema } from '../schemas/userValidation.js';

export class AdminController {
  public constructor(private readonly adminService: AdminService = new AdminService()) {}

  public async getStats(_request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await this.adminService.getStats();
      response.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  public async getUsers(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const q = typeof request.query.q === 'string' ? request.query.q : undefined;
      const limit = Number(request.query.limit) || 50;
      const page = Number(request.query.page) || 1;

      const result = await this.adminService.getUsers(q, limit, page);
      response.status(200).json({ success: true, data: result.users, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  public async updateUser(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
      const data = adminUpdateUserSchema.parse(request.body);
      const updated = await this.adminService.updateUser(userId, data);
      response.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  public async deleteUser(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const userId = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
      await this.adminService.deleteUser(userId);
      response.status(200).json({ success: true, message: 'Usuário removido com sucesso.' });
    } catch (error) {
      next(error);
    }
  }
}
