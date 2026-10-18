
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
    return str.replace(/<[^>]*>?/gm, '');
  }

  normalize(raw: CurrentsArticle, categoryId: string): NormalizedNews {
    // Trunca o título para respeitar o limite de 255 caracteres do banco
    const rawTitle = raw.title || 'Notícia sem título';
    const title = rawTitle.slice(0, 255);

    const rawSummary = raw.description || raw.summary || 'Sem resumo disponível.';
    const summary = this.stripHtmlTags(rawSummary);

    const rawContent = raw.content || raw.description || 'Conteúdo não informado.';
    const content = this.stripHtmlTags(rawContent);

    const imageUrl = raw.image && raw.image !== 'None' 
      ? raw.image 
      : 'https://via.placeholder.com/800x400';

    // Parse seguro de data com fallback
    let publishedAt = new Date();
    if (raw.published) {
      const parsedDate = new Date(raw.published);
      if (!isNaN(parsedDate.getTime())) {
        publishedAt = parsedDate;
      }
    }

    return {
      category_id: categoryId,
      badge_bg: 'bg-blue-500',
      title,
      summary,
      content,
      image_url: imageUrl,
      published_at: publishedAt,
      author: raw.author || 'Redação',
      source: raw.domain || raw.language || 'Currents API',
    };
  }
}