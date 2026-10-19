import { CurrentsArticle } from './CurrentsApiClient.js';

export interface NormalizedNews {
    category_id: string;
    badge_bg: string;
    title: string;
    summary: string;
    content: string;
    image_url: string;
    published_at: Date;
    author: string;
    source: string;
}

export class NewsNormalizer {
    private stripHtmlTags(str: string): string {
        return str.replace(/<[^>]*>?/gm, '').trim();
    }

    private extractDomain(url?: string): string {
        if (!url) return 'Currents API';
        try {
            return new URL(url).hostname.replace(/^www\./, '');
        } catch {
            return 'Currents API';
        }
    }

    normalize(raw: CurrentsArticle, category_id: string): NormalizedNews {
        // Título truncado a 255 chars
        const rawTitle = raw.title || 'Notícia sem título';
        const title = rawTitle.slice(0, 255);

        const rawSummary = raw.description || raw.summary || 'Sem resumo disponível.';
        const summary = this.stripHtmlTags(rawSummary);

        const rawContent = raw.content || raw.description || 'Conteúdo não informado.';
        const content = this.stripHtmlTags(rawContent);

        const image_url =
            raw.image && raw.image !== 'None' ? raw.image : 'https://via.placeholder.com/800x400';

        // Parse seguro de data com fallback
        let published_at = new Date();
        if (raw.published) {
            const parsed = new Date(raw.published);
            if (!isNaN(parsed.getTime())) {
                published_at = parsed;
            }
        }

        // Extrai o domínio real da URL em vez de usar o campo "language" como fallback
        const source = this.extractDomain(raw.url);

        return {
            category_id,
            badge_bg: 'bg-blue-500',
            title,
            summary,
            content,
            image_url,
            published_at,
            author: raw.author || 'Redação',
            source,
        };
    }
}
