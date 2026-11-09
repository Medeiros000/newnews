// backend/test/services/newsingestion/news.mock.ts
import { NormalizedNews } from '../../../../src/services/newsIngestion/NewsNormalizer.js';

export const mockNoticiasEntrada: NormalizedNews[] = [
  { title: 'TypeScript 5.5 Lançado', url: 'https://site.com/ts1' },          
  { title: 'Notícia Antiga do Banco', url: 'https://site.com/antiga' },    
  { title: 'TypeScript 5.5 Lançado', url: 'https://site.com/ts-duplicado' }, 
  { title: 'Node.js v22 Atualizações', url: 'https://site.com/node' },      
] as NormalizedNews[];

export const mockRetornoBancoPrisma = [
  { title: 'Notícia Antiga do Banco' },
];