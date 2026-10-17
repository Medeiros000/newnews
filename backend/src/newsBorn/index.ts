
import { fetchNewsFromApi } from './0_apiService';
import { NewsQueue } from './1_queue';
import { normalizeArticle } from './2_normalizer';
import { validateNewsItem } from './3_validator';
import { isDuplicate } from './4_deduplicator';
import { saveNewsToDatabase } from './5_database';

export async function runNewsPipeline(defaultCategoryId: string) {
  console.log('🔄 Iniciando processo de ingestão de notícias...');

  // 0. Puxa os dados brutos da Currents API
  const rawArticles = await fetchNewsFromApi();

  if (!rawArticles || rawArticles.length === 0) {
    console.log('⚠️ Nenhuma notícia retornada pela API ou ocorreu um erro.');
    return;
  }

  const queue = new NewsQueue();

  // 1. Coloca na fila limitando ao lote N + 1 (ex: 11 itens)
  queue.enqueue(rawArticles, 11);
  console.log(`📦 ${queue.length} notícias adicionadas à fila de processamento.`);

  let index = 0;
  while (queue.length > 0) {
    const rawArticle = queue.dequeue();
    
    // O primeiro item do lote (index 0) é o candidato principal a destaque (isHero)
    const isCandidateHero = (index === 0);
    index++;

    // 2. Normalizer (Traduz para o formato do banco)
    const normalized = normalizeArticle(rawArticle, defaultCategoryId, isCandidateHero);

    // 3. Validator (Valida com o Zod)
    const validated = validateNewsItem(normalized);
    if (!validated) {
      console.log('⚠️ Notícia descartada por falha na validação.');
      continue;
    }

    // 4. Deduplicator (Evita duplicadas no banco)
    const duplicate = await isDuplicate(validated);
    if (duplicate) {
      console.log(`🔁 Notícia duplicada ignorada: "${validated.title}"`);
      continue;
    }

    // 5. News Database (Salva no banco aplicando a regra de 24h do isHero)
    const saved = await saveNewsToDatabase(validated);
    console.log(`✅ Notícia salva com sucesso! ID: ${saved.id} | Destaque (isHero): ${saved.isHero}`);
  }

  console.log('✨ Pipeline de notícias executado com sucesso!');
}