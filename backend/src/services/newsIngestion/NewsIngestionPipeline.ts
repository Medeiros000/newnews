import { CurrentsApiClient } from './CurrentsApiClient.js';
import { NewsNormalizer } from './NewsNormalizer.js';
import { NewsValidator } from './NewsValidator.js';
import { NewsDeduplicator } from './NewsDeduplicator.js';
import { NewsRepository } from './NewsRepository.js';

export class NewsIngestionPipeline {
  constructor(
    private apiClient: CurrentsApiClient = new CurrentsApiClient(),
    private normalizer: NewsNormalizer = new NewsNormalizer(),
    private validator: NewsValidator = new NewsValidator(),
    private deduplicator: NewsDeduplicator = new NewsDeduplicator(),
    private repository: NewsRepository = new NewsRepository()
  ) {}

  async execute(defaultCategoryId: string) {
    console.log('🔄 Iniciando ingestão de notícias (POO)...');

    const rawArticles = await this.apiClient.fetchLatestNews();
    if (rawArticles.length === 0) {
      console.log('⚠️ Nenhuma notícia obtida da API.');
      return;
    }

    // Processa todos os artigos retornados pela API (sem slice arbitrário)
    const processedItems = [];
    for (const raw of rawArticles) {
      const normalized = this.normalizer.normalize(raw, defaultCategoryId);
      const validated = this.validator.validate(normalized);
      if (validated) {
        processedItems.push(validated);
      }
    }

    // Remove duplicadas em lote (1 única query ao banco)
    const uniqueItems = await this.deduplicator.filterDuplicates(processedItems);

    // Salva com tolerância a falhas individuais (1 erro não cancela o lote todo)
    let savedCount = 0;
    for (const item of uniqueItems) {
      try {
        const saved = await this.repository.save(item);
        console.log(`✅ Notícia salva! ID: ${saved.id} | "${item.title.slice(0, 60)}..."`);
        savedCount++;
      } catch (err: any) {
        console.error(`❌ Erro ao salvar "${item.title.slice(0, 60)}": ${err.message}`);
      }
    }

    console.log(`✨ Ingestão finalizada! ${savedCount}/${uniqueItems.length} notícias únicas salvas.`);
  }
}
