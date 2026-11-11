import { CurrentsArticle } from './CurrentsApiClient.js';

export interface NormalizedNews {
	id?: string;
	title?: string;
	description?: string;
	url?: string;
	author: string;
	image_url?: string;
	language?: string;
	category: string;
	source: string;
	published_at: Date;
}

export class NewsNormalizer {
	private extractDomain(url?: string): string {
		if (!url) return 'Currents API';
		try {
			return new URL(url).hostname.replace(/^www\./, '');
		} catch {
			return 'Currents API';
		}
	}

	normalize(raw: CurrentsArticle): NormalizedNews {
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
			id: raw.id,
			title: raw.title || raw.description?.slice(0, 60) || 'Sem título',
			description: raw.description || 'Conteúdo não informado.',
			url: raw.url,
			author: raw.author || 'Redação',
			image_url:
				raw.image && raw.image !== 'None' ? raw.image : 'https://via.placeholder.com/800x400',
			language: raw.language || 'pt-BR',
			category: raw.category?.[0] || 'general',
			source,
			published_at,
		};
	}
}
