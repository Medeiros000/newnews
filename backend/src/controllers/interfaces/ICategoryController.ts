import type { Response, Request } from 'express';

export interface ICategoryController {
  getAllCategories(_request: Request, response: Response): Promise<Response>;
  getCategoryById(_request: Request, response: Response): Promise<Response>;
}
