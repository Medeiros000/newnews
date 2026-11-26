import { getNewsIngestionWorker } from './workers/NewsIngestionWorker.js';
import { PrismaService } from './services/PrismaService.js';

const worker = getNewsIngestionWorker();
worker.start();

const shutdown = async (signal: 'SIGINT' | 'SIGTERM'): Promise<void> => {
	console.log(`Received ${signal}, shutting down news ingestion worker...`);
	worker.stop();
	await PrismaService.getInstance().$disconnect();
	console.log('News ingestion worker stopped.');
	process.exit(0);
};

process.once('SIGINT', () => {
	void shutdown('SIGINT');
});
process.once('SIGTERM', () => {
	void shutdown('SIGTERM');
});
