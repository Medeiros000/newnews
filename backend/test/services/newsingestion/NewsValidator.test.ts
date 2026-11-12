import { NewsValidator } from '../../../src/workers/ingestion/NewsValidator.js';

describe('NewsValidator', () => {
	const validator = new NewsValidator();
	let consoleError: jest.SpyInstance;

	beforeEach(() => {
		consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => {
		consoleError.mockRestore();
	});

	const validNews = {
		id: '550e8400-e29b-41d4-a716-446655440001',
		title: 'Novo recurso disponível',
		description: 'Descrição da notícia com informações relevantes.',
		url: 'https://example.com/noticia',
		author: 'Redação',
		image_url: 'https://example.com/imagem.jpg',
		language: 'pt-BR',
		category: 'general',
		source: 'example.com',
		published_at: new Date('2026-01-01T00:00:00.000Z'),
	};

	it('deve aceitar uma notícia válida', () => {
		expect(validator.validate(validNews)).toEqual(validNews);
	});

	it.each([
		['sem título', { ...validNews, title: '' }],
		['sem descrição', { ...validNews, description: '' }],
		['sem autor', { ...validNews, author: '' }],
		['sem idioma', { ...validNews, language: '' }],
		['sem categoria', { ...validNews, category: '' }],
		['sem fonte', { ...validNews, source: '' }],
		['sem URL de imagem', { ...validNews, image_url: '' }],
		['com URL de imagem inválida', { ...validNews, image_url: 'not-a-url' }],
	])('deve rejeitar uma notícia %s', (_description, news) => {
		expect(validator.validate(news)).toBeNull();
	});
});
