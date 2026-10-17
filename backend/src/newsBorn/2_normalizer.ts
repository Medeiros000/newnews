
export function normalizeArticle(rawArticle: any, categoryId: string, isCandidateHero: boolean = false) {
  return {
    category_id: categoryId,
    badgeBg: 'bg-blue-500',
    title: rawArticle.title || 'Notícia sem título',
    summary: rawArticle.description || rawArticle.summary || 'Sem resumo disponível.',
    content: rawArticle.description || rawArticle.title || 'Conteúdo não informado.',
    image_url: rawArticle.image && rawArticle.image !== 'None' 
      ? rawArticle.image 
      : 'https://via.placeholder.com/800x400',
    publishedAt: rawArticle.published 
      ? new Date(rawArticle.published).toISOString() 
      : new Date().toISOString(),
    author: rawArticle.author || 'Redação',
    source: rawArticle.domain || rawArticle.language || 'API de Notícias',
    isHero: isCandidateHero, // Define se veio marcada como candidata a hero neste lote
  };
}