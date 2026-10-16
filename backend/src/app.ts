import express, {
    type Application,
    type Request,
    type Response,
    type NextFunction,
    type ErrorRequestHandler,
} from "express";
import type { Server } from "http";
import { ZodError } from "zod";
import indexRouter from "./routes/index.js";
import { healthRouter } from "./routes/health.js";
import { usersRouter } from "./routes/users.js";
import { newsRouter } from "./routes/news.js";

export class App {
    public readonly instance: Application;

    constructor() {
        this.instance = express();
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupMiddlewares(): void {
        this.instance.use(express.json({ limit: "1mb" }));
    }

    private setupRoutes(): void {
        this.instance.use("/", indexRouter);
        this.instance.use("/api/users", usersRouter);
        this.instance.use("/api/health", healthRouter);
        this.instance.use("/api/news", newsRouter);
    }

    private setupErrorHandling(): void {
        this.instance.use((_request: Request, response: Response): void => {
            response.status(404).json({ error: "Not found" });
        });

        const errorHandler: ErrorRequestHandler = (
            error: unknown,
            _request: Request,
            response: Response,
            _next: NextFunction
        ): void => {
            if (error instanceof ZodError) {
                response.status(400).json({
                    error: "Invalid request",
                    issues: error.issues,
                });
                return;
            }

            console.error(error);
            response.status(500).json({ error: "Internal server error" });
        };

        this.instance.use(errorHandler);
    }

    public listen(port: number | string, callback?: () => void): Server {
        return this.instance.listen(port, callback);
    }
}