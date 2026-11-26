import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { ToastContainer } from '@/components/ToastContainer';
import { newsService } from '@/services/newsService';
import { useToastStore, useBookmarksStore, useNavigationStore } from '@/stores';
import { formatTimeAgo, getNewsPath } from '@/utils';
import {
  IconArrowLeft,
  IconClock,
  IconUser,
  IconShare,
  IconBookmark,
  IconTag,
} from '@tabler/icons-react';
import './NewsPage.css';

/**
 * Detailed News Article View page component.
 * Retrieves and renders full article details specified by URL params (slug + idPrefix)
 * or fallback query string (`id`).
 */
export function NewsPage() {
  const [searchParams] = useSearchParams();
  const { slug, idPrefix } = useParams();
  const navigate = useNavigate();
  const queryArticleId = searchParams.get('id');

  const [article, setArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = useToastStore((state) => state.showToastNotification);
  const { bookmarkedArticleIds, toggleArticleBookmark, markArticleAsRead } =
    useBookmarksStore();
  const categoryMap = useNavigationStore((state) => state.categoryMap);

  useEffect(() => {
    if (!queryArticleId && (!slug || !idPrefix)) {
      setError('Nenhuma notícia foi selecionada.');
      setIsLoading(false);
      return;
    }

    async function fetchArticleData() {
      try {
        setIsLoading(true);
        setError(null);

        let res;
        if (slug && idPrefix) {
          res = await newsService.getNewsBySlugAndPrefix(slug, idPrefix);
        } else {
          res = await newsService.getNewsById(queryArticleId);
        }

        const articleData = res.data;
        setArticle(articleData);

        const currentArticleId = articleData?.id || queryArticleId;
        if (currentArticleId) {
          markArticleAsRead(currentArticleId);

          // Fetch contextual related articles
          try {
            const relatedRes = await newsService.getRelatedNews(currentArticleId, {
              limit: 6,
            });
            const list =
              relatedRes.data?.news ||
              (Array.isArray(relatedRes.data) ? relatedRes.data : []);
            setRelatedNews(list);
          } catch {
            const categoryName = categoryMap[articleData?.categoryId];
            const fallbackRes = await newsService.getNews({
              category: categoryName || undefined,
              limit: 6,
            });
            const filtered = (fallbackRes.data || [])
              .filter((item) => String(item.id) !== String(currentArticleId))
              .slice(0, 6);
            setRelatedNews(filtered);
          }
        }
      } catch {
        setError('Não foi possível carregar os detalhes desta notícia.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticleData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, idPrefix, queryArticleId, categoryMap, markArticleAsRead]);

  const handleShare = () => {
    const currentUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      showToast(
        'Link da notícia copiado para a área de transferência!',
        'success',
        '🔗',
      );
    } else {
      showToast(`Compartilhando: ${article.title}`, 'info', '📢');
    }
  };

  const isBookmarked = article
    ? bookmarkedArticleIds.has(article.id)
    : false;

  return (
    <div className="min-vh-100 d-flex flex-column bg-body">
      {/* Reading Progress Indicator Bar */}
      <div
        className="position-fixed top-0 start-0 z-3 bg-primary"
        style={{
          height: '4px',
          width: `${scrollProgress}%`,
          transition: 'width 0.1s ease-out',
        }}
      />
      <Navbar />

      <main className="container-xl py-4 flex-grow-1">
        {/* Back navigation action returning to main feed view */}
        <button
          onClick={() => navigate('/')}
          className="btn btn-link text-decoration-none text-body p-0 mb-4 d-inline-flex align-items-center gap-2 fw-semibold nav-back-btn"
        >
          <IconArrowLeft size={20} />
          <span>Voltar para o feed</span>
        </button>

        {/* Async content loading indicator state */}
        {isLoading && (
          <div className="text-center py-5">
            <output className="spinner-border text-primary">
              <span className="visually-hidden">Carregando notícia...</span>
            </output>
          </div>
        )}

        {/* Error alert fallback when article data fetch fails */}
        {error && (
          <div className="alert alert-warning text-center my-4 rounded-3 p-4">
            <p className="mb-3 fw-semibold">{error}</p>
            <button
              className="btn btn-primary rounded-pill px-4"
              onClick={() => navigate('/')}
            >
              Voltar para o Feed
            </button>
          </div>
        )}

        {/* Main article content and related news layout */}
        {!isLoading && !error && article && (
          <div className="row g-4 lg-g-5">
            {/* Main article reading column */}
            <article className="col-12 col-lg-8">
              {/* Feature image cover with overlay category badge */}
              <div className="position-relative mb-4 overflow-hidden rounded-4 article-cover-wrapper">
                <img
                  src={article.imageUrl || article.image_url}
                  alt={article.title}
                  className="img-fluid w-100 object-fit-cover article-cover-img"
                />
                <span
                  className={`badge bg-${article.badgeBg || 'primary'} position-absolute bottom-0 start-0 m-3 px-3 py-2 rounded-pill fs-6 shadow-sm`}
                >
                  {categoryMap[article.category_id] || 'Geral'}
                </span>
              </div>

              {/* Headline and lead summary header */}
              <header className="mb-4">
                <h1 className="fw-bold mb-3 article-title">{article.title}</h1>
                <p className="lead text-secondary mb-3 article-summary">
                  {article.description}
                </p>

                {/* Article publication metadata and user action toolbar */}
                <div className="d-flex flex-wrap align-items-center justify-content-between py-3 border-top border-bottom gap-3 article-meta-bar">
                  <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
                    <span className="d-inline-flex align-items-center gap-1">
                      <IconClock size={18} className="text-muted" />
                      <time>{formatTimeAgo(article.published_at)}</time>
                    </span>
                    <span className="d-inline-flex align-items-center gap-1">
                      <IconUser size={18} className="text-muted" />
                      <span>Por {article.author || 'Redação NewsHub'}</span>
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <button
                      onClick={() => toggleArticleBookmark(article.id)}
                      className={`btn btn-sm ${isBookmarked ? 'btn-primary' : 'btn-outline-secondary'} rounded-pill d-inline-flex align-items-center gap-1`}
                      title={
                        isBookmarked ? 'Remover dos salvos' : 'Salvar notícia'
                      }
                    >
                      <IconBookmark
                        size={16}
                        fill={isBookmarked ? 'currentColor' : 'none'}
                      />
                      <span>{isBookmarked ? 'Salvo' : 'Salvar'}</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="btn btn-sm btn-outline-secondary rounded-pill d-inline-flex align-items-center gap-1"
                    >
                      <IconShare size={16} />
                      <span>Compartilhar</span>
                    </button>
                  </div>
                </div>
              </header>

              {/* Main article body content paragraphs */}
              <section className="article-body-content">
                {typeof article.content === 'string'
                  ? article.content
                      .split(/\n\s*\n/)
                      .filter(Boolean)
                      .map((paragraph, index) => (
                        <p key={index} className="mb-3 fs-5 lh-base">
                          {paragraph}
                        </p>
                      ))
                  : Array.isArray(article.content)
                    ? article.content.map((paragraph, index) => (
                        <p key={index} className="mb-3 fs-5 lh-base">
                          {paragraph}
                        </p>
                      ))
                    : (
                      <p className="mb-3 fs-5 lh-base">{article.description}</p>
                    )}
              </section>

              {/* Tags Section */}
              {Array.isArray(article.tags) && article.tags.length > 0 && (
                <div className="article-tags-section mt-5 pt-4 border-top">
                  <h3 className="h6 fw-bold text-uppercase text-secondary tracking-wider mb-3 d-flex align-items-center gap-2">
                    <IconTag size={18} />
                    <span>Tags Relacionadas</span>
                  </h3>
                  <div className="d-flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link
                        key={tag.id || tag.slug}
                        to={`/?tag=${encodeURIComponent(tag.slug || tag.name)}`}
                        className="badge text-decoration-none rounded-pill px-3 py-2 article-tag-badge"
                      >
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* Sidebar column presenting contextually related news recommendations */}
            <aside className="col-12 col-lg-4">
              <div className="sticky-lg-top" style={{ top: '90px' }}>
                <h2 className="h5 fw-bold mb-3 pb-2 border-bottom">
                  Notícias relacionadas
                </h2>

                <div className="d-flex flex-column gap-3">
                  {relatedNews.map((item) => {
                    const itemPath = getNewsPath(item);
                    return (
                      <Link
                        key={item.id}
                        to={itemPath}
                        className="card border-0 shadow-sm rounded-3 overflow-hidden related-card text-decoration-none d-block"
                      >
                        <div className="card-body p-3 d-flex gap-3 align-items-center">
                          <img
                            src={item.imageUrl || item.image_url}
                            alt={item.title}
                            className="rounded-3 object-fit-cover related-thumb"
                          />
                          <div className="d-flex flex-column justify-content-between min-w-0">
                            <span
                              className={`badge bg-${item.badgeBg || 'primary'} bg-opacity-10 text-${item.badgeBg || 'primary'} align-self-start mb-1 rounded-pill`}
                            >
                              {categoryMap[item.category_id] || 'Geral'}
                            </span>
                            <h3 className="h6 fw-semibold mb-1 text-truncate-2 text-body">
                              {item.title}
                            </h3>
                            {Array.isArray(item.tags) && item.tags.length > 0 && (
                              <div className="d-flex flex-wrap gap-1 mb-1">
                                {item.tags.slice(0, 2).map((t) => (
                                  <span
                                    key={t.id || t.slug}
                                    className="badge bg-secondary-subtle text-secondary small py-0 px-2 rounded-pill"
                                  >
                                    #{t.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            <span className="text-secondary small d-inline-flex align-items-center gap-1">
                              <IconClock size={14} />
                              {formatTimeAgo(item.published_at)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <ToastContainer />
    </div>
  );
}
