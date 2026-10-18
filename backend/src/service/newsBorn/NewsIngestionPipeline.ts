
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
    console.log(' Iniciando ingestão de notícias (POO)...');

    const rawArticles = await this.apiClient.fetchLatestNews();
    if (rawArticles.length === 0) {
      console.log(' Nenhuma notícia obtida da API.');
      return;
    }

    // Limita o lote N+1 (ex: 11 itens)
    const limitedRaw = rawArticles.slice(0, 11);

    // 1. Normaliza e valida todas do lote
    const processedItems = [];
    for (const raw of limitedRaw) {
      const normalized = this.normalizer.normalize(raw, defaultCategoryId);
      const validated = this.validator.validate(normalized);
      if (validated) {
        processedItems.push(validated);
      }
    }

    // 2. Remove duplicadas em lote
    const uniqueItems = await this.deduplicator.filterDuplicates(processedItems);

    // 3. Salva no banco com tratamento de erro individual (tolerância a falhas)
    let savedCount = 0;
    for (const item of uniqueItems) {
      try {
        const saved = await this.repository.save(item);
        console.log(` Notícia salva com sucesso! ID: ${saved.id}`);
        savedCount++;
      } catch (err: any) {
        console.error(` Erro ao salvar a notícia "${item.title}":`, err.message);
      }
    }

    console.log(` Ingestão finalizada! ${savedCount} notícias salvas com sucesso.`);
  }
}