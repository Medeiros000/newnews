import type { Server } from 'http';
import { App } from './app.js';
import { env } from './config/env.js';

const app = new App();

const server: Server = app.listen(env.PORT, () => {
    console.log(`API server listening on http://localhost:${env.PORT}`);
});

const shutdown = (signal: 'SIGINT' | 'SIGTERM'): void => {
    console.log(`Received ${signal}, shutting down...`);
    app.stopIngestionScheduler();
    server.close(async (error?: Error) => {
        if (error) {
            console.error('Error while closing HTTP server:', error);
            process.exit(1);
        }
        console.log('HTTP server closed.');
        process.exit(0);
    });
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
