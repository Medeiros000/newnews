// backend/src/services/newsIngestion/run.ts
import { randomUUID } from 'node:crypto';
import { NewsIngestionPipeline } from './NewsIngestionPipeline.js';

async function main() {
  const categoryId = process.env.DEFAULT_CATEGORY_UUID || randomUUID();
  console.log(`Usando category_id: ${categoryId}`);
  const pipeline = new NewsIngestionPipeline();
  await pipeline.execute(categoryId);
  process.exit(0);
}

main();