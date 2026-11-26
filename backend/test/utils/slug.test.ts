import { describe, expect, it } from '@jest/globals';
import { generateSlug } from '../../src/utils/slug.js';

describe('generateSlug', () => {
  it('converte string em slug padronizado (minúsculas, sem acentos, separado por hífens)', () => {
    expect(generateSlug('TypeScript 5.5 Lançado: Novidades & Recursos!')).toBe(
      'typescript-55-lancado-novidades-recursos',
    );
  });

  it('lida com múltiplos espaços e pontuações', () => {
    expect(generateSlug('  Atenção:   Notícia de Última Hora -- Urgente!  ')).toBe(
      'atencao-noticia-de-ultima-hora-urgente',
    );
  });

  it('retorna string vazia para texto vazio ou nulo', () => {
    expect(generateSlug('')).toBe('');
  });
});
