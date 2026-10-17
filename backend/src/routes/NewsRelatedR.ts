// src/routes/newsRoutes.ts
import { Router } from 'express';
import { newsController } from '../controllers/NewsRelated.js';
import { validateRequest } from '../middlewares/NewsRelatedMW.js';
import { getRelatedNewsSchema } from '../schemas/NewsRelatedSchemas.js';

const newsRoutes = Router();

newsRoutes.get(
  '/:id/related',
  validateRequest(getRelatedNewsSchema),
  newsController.getRelated
);

export { newsRoutes };