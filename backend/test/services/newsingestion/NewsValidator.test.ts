import { NewsValidator } from '../../../src/services/newsIngestion/NewsValidator.js';

describe('NewsValidator', () => {
	const validator = new NewsValidator();

	const validNews = {
		category_id: '550e8400-e29b-41d4-a716-446655440000',
		badge_bg: 'bg-blue-500',
		title: 'Novo recurso disponível',
		summary: 'Resumo da notícia com informações relevantes.',
		content: 'Conteúdo completo da notícia para validação.',
		image_url: 'https://example.com/imagem.jpg',
		published_at: new Date('2026-01-01T00:00:00.000Z'),
		author: 'Redação',
		source: 'example.com',
	};

	it('deve aceitar uma notícia válida', () => {
		expect(validator.validate(validNews)).toEqual(validNews);
	});

	it.each([
		['sem título', { ...validNews, title: '' }],
		['sem conteúdo', { ...validNews, content: '' }],
		['sem resumo', { ...validNews, summary: '' }],
		['com URL de imagem inválida', { ...validNews, image_url: 'not-a-url' }],
	])('deve rejeitar uma notícia %s', (_description, news) => {
		expect(validator.validate(news)).toBeNull();
	});

	it('deve rejeitar uma notícia nula ou indefinida', () => {
		expect(validator.validate(null)).toBeNull();
		expect(validator.validate(undefined)).toBeNull();
	});
});
