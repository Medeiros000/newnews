import type { NormalizedNews } from '../NewsNormalizer.js';
import { newsValidationSchema } from '../NewsValidator.js';
import { AbstractNewsHandler } from './INewsHandler.js';

export class ValidationHandler extends AbstractNewsHandler {
    public async handle(news: NormalizedNews): Promise<NormalizedNews | null> {
        const result = newsValidationSchema.safeParse(news);
        if (!result.success) {
            console.error('❌ Falha na validação Zod:', result.error.format());
            return null; // interrompe a cadeia
        }
        return this.passToNext(result.data);
    }
}

