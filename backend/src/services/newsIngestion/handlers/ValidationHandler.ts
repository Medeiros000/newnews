import type { NormalizedNews } from '../NewsNormalizer.js';
import { newsValidationSchema } from '../NewsValidator.js';
import { AbstractNewsHandler } from './INewsHandler.js';
import { Logger } from '../../../utils/Logger.js';

export class ValidationHandler extends AbstractNewsHandler<NormalizedNews, NormalizedNews> {
    private readonly logger = new Logger('ValidationHandler');

    public async handle(news: NormalizedNews): Promise<NormalizedNews | null> {
        const result = newsValidationSchema.safeParse(news);
        if (!result.success) {
            this.logger.error(`Falha na validação Zod para "${news.title}":`, result.error.format());
            return null;
        }
        return this.passToNext(result.data);
    }
}
