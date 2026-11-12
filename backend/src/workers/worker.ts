import { createNewsIngestionWorker } from './NewsIngestionWorker.js';
import { PrismaService } from '../services/PrismaService.js';
import { createCacheProvider } from '../services/cache/createCacheProvider.js';

const prisma = PrismaService.getInstance();
const cache = createCacheProvider();
const worker = createNewsIngestionWorker(cache);
worker.start();

const shutdown = async (signal: 'SIGINT' | 'SIGTERM'): Promise<void> => {
	console.log(`Received ${signal}, shutting down news ingestion worker...`);
	worker.stop();
	await prisma.$disconnect();
	console.log('News ingestion worker stopped.');
	process.exit(0);
};

process.once('SIGINT', () => {
	void shutdown('SIGINT');
});
process.once('SIGTERM', () => {
	void shutdown('SIGTERM');
});
