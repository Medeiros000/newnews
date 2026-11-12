import express, {
	type Application,
	type Request,
	type Response,
	type NextFunction,
	type ErrorRequestHandler,
} from 'express';
import type { Server } from 'http';
import { ZodError } from 'zod';
import { IndexRouter } from './routes/IndexRouter.js';
import { HealthRouter } from './routes/HealthRouter.js';
import { CategoryController } from './controllers/CategoryController.js';
import { NewsController } from './controllers/NewsController.js';
import { NewsRouter } from './routes/NewsRouter.js';
import { PrismaService } from './services/PrismaService.js';
import type { CacheProvider } from './services/cache/CacheProvider.js';
import { CategoryService } from './services/CategoryService.js';
import { NewsService } from './services/NewsService.js';
import { CategoryRouter } from './routes/CategoryRouter.js';
import { NewsIngestionRouter } from './routes/NewsIngestionRouter.js';
import cors from 'cors';

export class App {
	public readonly instance: Application;
	private readonly cors: any;

	constructor(
		private readonly prisma: PrismaService,
		private readonly cache: CacheProvider,
	) {
		this.instance = express();
		this.cors = cors();
		this.setupMiddlewares();
		this.setupRoutes();
		this.setupErrorHandling();
	}

	private setupMiddlewares(): void {
		this.instance.use(this.cors);
		this.instance.use(express.json({ limit: '1mb' }));
	}

	private setupRoutes(): void {
		const healthRouter = new HealthRouter();
		const indexRouter = new IndexRouter();
		const categoryRouter = new CategoryRouter(
			new CategoryController(new CategoryService(this.prisma, this.cache)),
		);
		const newsController = new NewsController(new NewsService(this.prisma, this.cache));
		const newsRouter = new NewsRouter(newsController);
		const newsIngestionRouter = new NewsIngestionRouter();

		this.instance.use('/api/news', newsRouter.router);
		this.instance.use('/api/jobs/news-ingestion', newsIngestionRouter.router);
		this.instance.use('/', indexRouter.router);
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
			if (error instanceof ZodError) {
				response.status(400).json({
					error: 'Invalid request',
					issues: error.issues,
				});
				return;
			}

			console.error(error);
			response.status(500).json({ error: 'Internal server error' });
		};

		this.instance.use(errorHandler);
	}

	public listen(port: number | string, callback?: () => void): Server {
		return this.instance.listen(port, callback);
	}
}
