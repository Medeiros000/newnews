// backend/src/services/newsIngestion/run.ts
import { NewsIngestionPipeline } from './NewsIngestionPipeline.js';

async function main() {
  const categoryId = process.env.DEFAULT_CATEGORY_UUID || 'COLOCA_UM_UUID_VALIDO_AQUI';
  const pipeline = new NewsIngestionPipeline();
  await pipeline.execute(categoryId);
  process.exit(0);
}

main();