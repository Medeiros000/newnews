import type { Server } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { PrismaService } from './services/PrismaService.js';

const server: Server = app.listen(env.PORT, () => {
	console.log(`API server listening on http://localhost:${env.PORT}`);
});

const shutdown = (signal: 'SIGINT' | 'SIGTERM'): void => {
	console.log(`Received ${signal}, shutting down...`);
	server.close(async (error?: Error) => {
		if (error) {
			console.error('Error while closing HTTP server:', error);
			process.exit(1);
		}
		await PrismaService.getInstance().$disconnect();
		console.log('HTTP server closed.');
		process.exit(0);
	});
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
