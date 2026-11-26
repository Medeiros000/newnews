/**
 * Converte um título em slug padronizado (minúsculas, sem acentos, separado por hífen).
 */
export function generateSlug(text) {
  if (!text) return 'noticia';

  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'noticia';
}

/**
 * Retorna o caminho de rota amigável para uma notícia: /news/:slug/:idPrefix
 * onde idPrefix são os 8 primeiros caracteres do id.
 */
export function getNewsPath(article) {
  if (!article) return '/';
  const id = String(article.id || '');
  const idPrefix = id.slice(0, 8) || '00000000';
  const slug = article.slug || generateSlug(article.title);
  return `/news/${slug}/${idPrefix}`;
}
