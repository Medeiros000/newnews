import type { ICommand } from './ICommand.js';
import { NewsIngestionPipeline } from '../services/newsIngestion/NewsIngestionPipeline.js';

export class IngestNewsCommand implements ICommand {
    public constructor(
        private readonly pipeline: NewsIngestionPipeline = new NewsIngestionPipeline(),
    ) {}

    public async execute(): Promise<void> {
        await this.pipeline.execute();
    }
}