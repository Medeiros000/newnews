import { createNewsIngestionWorker } from './NewsIngestionWorker.js';
import { PrismaService } from '../services/PrismaService.js';
import { createCacheProvider } from '../services/cache/createCacheProvider.js';

async function runStandaloneIngestion(): Promise<void> {
	console.log('🚀 Iniciando script de ingestão única...');
	const prisma = PrismaService.getInstance();
	const cache = createCacheProvider();
	const worker = createNewsIngestionWorker(cache);

	try {
		await worker.runOnce();
		console.log('✅ Ingestão finalizada com sucesso!');
	} catch (error) {
		console.error('❌ Falha ao executar ingestão:', error);
		process.exitCode = 1;
	} finally {
		await prisma.$disconnect();
		console.log('🔌 Conexão com banco encerrada.');
	}
}

void runStandaloneIngestion();
