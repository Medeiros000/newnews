import express, {
    type Application,
    type Request,
    type Response,
    type NextFunction,
    type ErrorRequestHandler,
} from 'express';
import type { Server } from 'http';
import { ZodError } from 'zod';
import indexRouter from './routes/index.js';
import { healthRouter } from './routes/health.js';
import { usersRouter } from './routes/users.js';
import { newsRouter } from './routes/news.js';
import { PrismaService } from './lib/prisma.js';
import { RedisService } from './lib/redis.js';
import { NewsIngestionPipeline } from './services/newsIngestion/NewsIngestionPipeline.js';
import CategoryRouter from './routes/CategoryRouter.js';

const INGESTION_INTERVAL_MS = 60 * 60 * 1000; // 1 hora

export class App {
    public readonly instance: Application;
    private readonly pipeline: NewsIngestionPipeline;
    private ingestionTimer?: ReturnType<typeof setInterval>;

    constructor(
        private readonly prisma: PrismaService,
        private readonly cache?: RedisService,
    ) {
        this.instance = express();
        this.pipeline = new NewsIngestionPipeline(prisma, cache);
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
        this.startIngestionScheduler();
    }

    private setupMiddlewares(): void {
        this.instance.use(express.json({ limit: '1mb' }));
    }

    private setupRoutes(): void {
        this.instance.use('/', indexRouter);
        this.instance.use('/api/categories', new CategoryRouter().router);
        this.instance.use('/api/users', usersRouter);
        this.instance.use('/api/health', healthRouter);
        this.instance.use('/api/news', newsRouter);
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

    private startIngestionScheduler(): void {
        const run = async () => {
            try {
                await this.pipeline.execute();
            } catch (error) {
                console.error('❌ Erro no agendamento da ingestão:', error);
            }
        };

        // Executa imediatamente ao iniciar e depois a cada hora
        run();
        this.ingestionTimer = setInterval(run, INGESTION_INTERVAL_MS);
        console.log(
            `⏱️  Ingestão de notícias agendada para rodar a cada ${INGESTION_INTERVAL_MS / 60_000} minutos.`,
        );
    }

    public stopIngestionScheduler(): void {
        if (this.ingestionTimer) {
            clearInterval(this.ingestionTimer);
        }
    }

    public listen(port: number | string, callback?: () => void): Server {
        return this.instance.listen(port, callback);
    }
}
