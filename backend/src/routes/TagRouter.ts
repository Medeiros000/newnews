import { Router } from 'express';
import { TagController } from '../controllers/TagController.js';
import type { ITagController } from '../controllers/interfaces/ITagController.js';

export class TagRouter {
  public readonly router: Router;
  private readonly controller: ITagController;

  public constructor(controller: ITagController = new TagController()) {
    this.router = Router();
    this.controller = controller;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', this.controller.getTags.bind(this.controller));
    this.router.get('/:slug/news', this.controller.getNewsByTagSlug.bind(this.controller));
  }
}
