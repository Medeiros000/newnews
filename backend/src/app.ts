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
import { IngestNewsCommand } from './commands/IngestNewsCommand.js';
import cors from 'cors';

const INGESTION_INTERVAL_MS = 60 * 60 * 1000; // 1 hora

export class App {
    public readonly instance: Application;
    private readonly ingestionCommand: IngestNewsCommand;
    private ingestionTimer?: ReturnType<typeof setInterval>;
    private readonly cors: any;

    constructor() {
        this.instance = express();
        this.cors = cors();
        this.instance.use(this.cors); // Habilita CORS para todas as rotas
        this.ingestionCommand = new IngestNewsCommand();
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
        this.startIngestionScheduler();
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
            console.error(error);


            console.error(error);
            response.status(500).json({ error: 'Internal server error' });
        };

        this.instance.use(errorHandler);
    }

    private startIngestionScheduler(): void {
        const run = async () => {
            try {
                await this.ingestionCommand.execute();
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
