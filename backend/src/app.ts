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
import { PrismaService } from './services/PrismaServce.js';
import { RedisService } from './services/RedisService.js';
import { NewsIngestionPipeline } from './services/newsIngestion/NewsIngestionPipeline.js';
import { CategoryRouter } from './routes/CategoryRouter.js';
import { Pagination } from './models/Pagination.js';


const INGESTION_INTERVAL_MS = 60 * 60 * 1000; // 1 hora

export class App {
    public pagination = new Pagination(1, 10, 100); 
    public readonly instance: Application;
    private readonly pipeline: NewsIngestionPipeline;
    private ingestionTimer?: ReturnType<typeof setInterval>;

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) {
        this.instance = express();
        this.pipeline = new NewsIngestionPipeline(prisma, redis);
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
        this.startIngestionScheduler();
        console.log(this.pagination.toJSON());
    }

    private setupMiddlewares(): void {
        this.instance.use(express.json({ limit: '1mb' }));
    }

    private setupRoutes(): void {
        this.instance.use('/', indexRouter);
        const categoryRouter = new CategoryRouter(this.prisma, this.redis);
        const userRouter = new UserRouter(this.prisma);
        const newsRouter = new NewsRouter(this.prisma, this.redis);
        const healthRouter = new HealthRouter();

        this.instance.use('/api/categories', categoryRouter.router);
        this.instance.use('/api/users', userRouter.router);
        this.instance.use('/api/health', healthRouter.router);
        this.instance.use('/api/news', newsRouter.router);
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
            console.error(error);


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
