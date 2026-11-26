import type { NextFunction, Request, Response } from 'express';
import { ITagService } from '../services/interfaces/ITagService.js';
import { TagService } from '../services/TagService.js';
import { ITagController } from './interfaces/ITagController.js';
import { QueryOptions } from '../queries/QueryOptions.js';

export class TagController implements ITagController {
  public constructor(private readonly service: ITagService = new TagService()) {}

  public async getTags(request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      const q = typeof request.query.q === 'string' ? request.query.q : undefined;
      const limit = Number(request.query.limit) || 20;

      const tags = await this.service.getTags(q, limit);
      response.status(200).json({
        success: true,
        data: tags,
      });
    } catch (error) {
      next(error);
    }
  }

  public async getNewsByTagSlug(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const slugParam = Array.isArray(request.params.slug)
        ? request.params.slug[0]
        : request.params.slug;
      const page = Number(request.query.page) || 1;
      const limit = Number(request.query.limit) || 10;

      const result = await this.service.getNewsByTagSlug(
        slugParam,
        new QueryOptions({ page, limit }),
      );

      if (!result) {
        response.status(404).json({
          success: false,
          error: 'Tag não encontrada',
        });
        return;
      }

      response.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
