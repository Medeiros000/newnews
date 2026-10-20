import { env } from '../../config/env.js';

export interface CurrentsArticle {
    id?: string;
    title?: string;
    description?: string;
    summary?: string;
    content?: string;
    image?: string;
    url?: string;
    published?: string;
    author?: string;
    domain?: string;
    language?: string;
    category?: string[];
}

export class CurrentsApiClient {
    private apiKey: string;
    private baseUrl = 'https://api.currentsapi.services/v1/latest-news';

    constructor() {
        this.apiKey = env.CURRENTS_API_KEY || '';
        if (!this.apiKey) {
            console.warn('⚠️ AVISO: CURRENTS_API_KEY não está configurada no ambiente.');
        }
    }

    async fetchLatestNews(): Promise<CurrentsArticle[]> {
        try {
            const url = `${this.baseUrl}?language=pt&apiKey=${this.apiKey}`;
            console.log(`🔗 Requisição para Currents API: ${url}`);
            const response = await fetch(url, {
                signal: AbortSignal.timeout(8000),
            });

            if (response.status === 401) {
                console.error(
                    '❌ Erro 401: Unauthorized - Chave da Currents API inválida ou expirada.',
                );
                return [];
            }

            if (response.status === 429) {
                console.error('❌ Erro 429: Too Many Requests - Cota da Currents API esgotada.');
                return [];
            }

            if (!response.ok) {
                console.error(
                    `❌ Erro HTTP na Currents API: ${response.status} ${response.statusText}`,
                );
                return [];
            }

            const data = (await response.json()) as { news?: CurrentsArticle[] };
            return data.news || [];
        } catch (error: any) {
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                console.error('❌ Timeout: A Currents API demorou mais de 8s para responder.');
            } else {
                console.error('❌ Erro ao conectar com a Currents API:', error.message);
            }
            return [];
        }
    }
}
