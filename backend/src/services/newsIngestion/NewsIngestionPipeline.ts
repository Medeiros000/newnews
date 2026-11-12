import { CurrentsApiClient } from './CurrentsApiClient.js';
import { NewsNormalizer } from './NewsNormalizer.js';
import { NewsValidator } from './NewsValidator.js';
import { NewsRepository } from './NewsRepository.js';
import type { CacheProvider } from '../cache/CacheProvider.js';
import { createCacheProvider } from '../cache/createCacheProvider.js';
import { randomUUID } from 'node:crypto';

const NEWS_INGESTION_LOCK_KEY = 'jobs:news-ingestion';
const NEWS_INGESTION_LOCK_TTL_SECONDS = 15 * 60;

export class NewsIngestionPipeline {
	private readonly repository: NewsRepository;
	private readonly apiClient: CurrentsApiClient;
	private readonly normalizer: NewsNormalizer;
	private readonly validator: NewsValidator;
	private readonly cache: CacheProvider;

	constructor(cache: CacheProvider = createCacheProvider()) {
		this.cache = cache;
		this.repository = new NewsRepository();
		this.apiClient = new CurrentsApiClient();
		this.normalizer = new NewsNormalizer();
		this.validator = new NewsValidator();
	}

	async execute(): Promise<boolean> {
		const lockToken = randomUUID();
		const lockAcquired = this.cache.tryAcquireLock
			? await this.cache.tryAcquireLock(
					NEWS_INGESTION_LOCK_KEY,
					lockToken,
					NEWS_INGESTION_LOCK_TTL_SECONDS,
				)
			: true;

		if (!lockAcquired) {
			console.log('⏭️ Ingestão ignorada: já existe uma execução em andamento.');
			return false;
		}

		try {
			console.log('🔄 Iniciando ingestão de notícias (POO)...');

			const rawArticles = await this.apiClient.fetchLatestNews();
			if (rawArticles.length === 0) {
				console.log('⚠️ Nenhuma notícia obtida da API.');
				return true;
			}

			// Processa todos os artigos retornados pela API (sem slice arbitrário)
			const processedItems = [];
			for (const raw of rawArticles) {
				const normalized = this.normalizer.normalize(raw);
				const validated = this.validator.validate(normalized);
				if (validated) {
					processedItems.push(validated);
				}
			}

			// Salva com tolerância a falhas individuais (1 erro não cancela o lote todo)
			const result = await this.repository.saveMany(processedItems);
			const savedCount = result.count || 0;

			// Invalida cache de listagem caso novas notícias tenham sido adicionadas
			if (savedCount > 0) {
				await this.cache.delByPattern('news:list:*');
				console.log('🧹 Cache de listagem de notícias invalidado com sucesso.');
			}

			console.log(
				`✨ Ingestão finalizada! ${savedCount}/${processedItems.length} notícias únicas salvas.`,
			);
			return true;
		} finally {
			if (this.cache.releaseLock) {
				await this.cache.releaseLock(NEWS_INGESTION_LOCK_KEY, lockToken);
			}
		}
	}
}
