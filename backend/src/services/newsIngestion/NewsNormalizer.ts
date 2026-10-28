import { slugify } from '../../utils/slugify.js';
import { CurrentsArticle } from './CurrentsApiClient.js';

export interface NormalizedNews {
  category?: string[];
  badge_bg: string;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  news_url: string;
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

  public normalize(raw: CurrentsArticle): NormalizedNews {
    // Título truncado a 255 chars
    const rawTitle = raw.title || raw.description?.slice(0, 60) || 'Notícia sem título';
    const title = rawTitle.slice(0, 255);
    const slug = slugify(title);

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
    const category = Array.isArray(raw.category)
      ? raw.category
          .filter((value): value is string => typeof value === 'string')
          .flatMap((value) => value.split(','))
          .map((value) => value.trim())
          .filter(Boolean)
      : typeof raw.category === 'string'
        ? raw.category
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean)
        : undefined;
    return {
      ...(category && category.length > 0 ? { category } : {}),
      badge_bg: 'bg-blue-500',
      title,
      slug,
      content,
      image_url,
      news_url: raw.url || '',
      published_at,
      author: raw.author || 'Redação',
      source,
    };
  }
}
