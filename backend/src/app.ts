import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
  type ErrorRequestHandler,
} from 'express';
import type { Server } from 'http';
import { indexRouter } from './routes/index.js';
import { HealthRouter } from './routes/HealthRouter.js';
import { UserRouter } from './routes/UserRouter.js';
import { NewsRouter } from './routes/NewsRouter.js';
import { CategoryRouter } from './routes/CategoryRouter.js';
import { Logger } from './utils/Logger.js';
import cors from 'cors';

export class App {
  private readonly logger = new Logger('App');
  public readonly instance: Application;
  private readonly cors: any;

  constructor() {
    this.instance = express();
    this.cors = cors();
    this.instance.use(this.cors);
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    this.instance.use(express.json({ limit: '1mb' }));
  }

  private setupRoutes(): void {
    const userRouter = new UserRouter();
    const newsRouter = new NewsRouter();
    const healthRouter = new HealthRouter();
    const categoryRouter = new CategoryRouter();

    this.instance.use('/', indexRouter);
    this.instance.use('/api/news', newsRouter.router);
    this.instance.use('/api/users', userRouter.router);
    this.instance.use('/api/health', healthRouter.router);
    this.instance.use('/api/categories', categoryRouter.router);
  }

  private setupErrorHandling(): void {
    this.instance.use((_request: Request, response: Response): void => {
      response.status(404).json({ error: 'Not found' });
    });

    const errorHandler: ErrorRequestHandler = (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ): void => {
      this.logger.error('Erro interno na requisição:', error);
      response.status(500).json({ error: 'Internal server error' });
    };

    this.instance.use(errorHandler);
  }

  public listen(port: number | string, callback?: () => void): Server {
    return this.instance.listen(port, callback);
  }
}
