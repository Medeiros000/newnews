import type { NormalizedNews } from '../NewsNormalizer.js';
import { AbstractNewsHandler } from './INewsHandler.js';

export class DeduplicationHandler extends AbstractNewsHandler {
    private readonly seenTitles = new Set<string>();
    private readonly seenSlugs = new Set<string>();

    public constructor(
        private readonly existingTitles: ReadonlySet<string>,
        private readonly existingSlugs: ReadonlySet<string>,
    ) {
        super();
    }

    public async handle(news: NormalizedNews): Promise<NormalizedNews | null> {
        if (this.existingTitles.has(news.title) || this.existingSlugs.has(news.slug)) {
            console.log(`🔁 Duplicada ignorada (banco): "${news.title}"`);
            return null; // interrompe a cadeia
        }

        if (this.seenTitles.has(news.title) || this.seenSlugs.has(news.slug)) {
            console.log(`🔁 Duplicada ignorada (lote): "${news.title}"`);
            return null; // interrompe a cadeia
        }

        this.seenTitles.add(news.title);
        this.seenSlugs.add(news.slug);
        return this.passToNext(news);
    }
}

