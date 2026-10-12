import { Router } from "express";
import { newsController } from "../controllers/newsController.js";

export const newsRouter = Router();


newsRouter.get('/', newsController.searchNews);

newsRouter.get("/:id", newsController.getNewsById);
