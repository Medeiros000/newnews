import { NewsIngestionPipeline } from './ingestion/NewsIngestionPipeline.js';
import type { CacheProvider } from '../services/cache/CacheProvider.js';
import { createCacheProvider } from '../services/cache/createCacheProvider.js';

export const NEWS_INGESTION_INTERVAL_MS = 60 * 60 * 1000;

export interface NewsIngestionExecutor {
	execute(): Promise<void>;
}

export class NewsIngestionWorker {
	private ingestionTimer?: ReturnType<typeof setInterval>;
	private isRunning = false;

	constructor(
		private readonly pipeline: NewsIngestionExecutor = new NewsIngestionPipeline(),
		private readonly intervalMs: number = NEWS_INGESTION_INTERVAL_MS,
	) {}

	public start(): void {
		if (this.ingestionTimer) {
			return;
		}

		void this.run();
		this.ingestionTimer = setInterval(() => {
			void this.run();
		}, this.intervalMs);

		console.log(
			`⏱️  Ingestão de notícias agendada para rodar a cada ${this.intervalMs / 60_000} minutos.`,
		);
	}

	public stop(): void {
		if (!this.ingestionTimer) {
			return;
		}

		clearInterval(this.ingestionTimer);
		this.ingestionTimer = undefined;
	}

	public async runOnce(): Promise<void> {
		await this.run();
	}

	private async run(): Promise<void> {
		if (this.isRunning) {
			return;
		}

		this.isRunning = true;
		try {
			await this.pipeline.execute();
		} catch (error) {
			console.error('❌ Erro na ingestão de notícias:', error);
		} finally {
			this.isRunning = false;
		}
	}
}

export function createNewsIngestionWorker(cache?: CacheProvider): NewsIngestionWorker {
	return new NewsIngestionWorker(new NewsIngestionPipeline(cache ?? createCacheProvider()));
}
