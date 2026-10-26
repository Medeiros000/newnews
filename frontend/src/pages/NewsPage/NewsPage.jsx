import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { ToastContainer } from '@/components/ToastContainer';
import { newsService } from '@/services/newsService';
import { useToastStore, useBookmarksStore } from '@/stores';
import {
  IconArrowLeft,
  IconClock,
  IconUser,
  IconShare,
  IconBookmark,
  IconLinkFilled,
  IconLinkPlus,
} from '@tabler/icons-react';
import './NewsPage.css';

/**
 * Detailed News Article View page component.
 * Retrieves and renders full article details specified by the URL query string (`id`),
 * automatically registers read status in bookmarks store, and fetches contextual related
 * articles scored by category proximity and keyword similarity.
 */
export function NewsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const articleSlug = slug;
  const [article, setArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const showToast = useToastStore((state) => state.showToastNotification);
  const { bookmarkedArticleIds, toggleArticleBookmark, markArticleAsRead } =
    useBookmarksStore();

  useEffect(() => {
    if (!articleSlug) {
      setError('Nenhuma notícia foi selecionada.');
      setIsLoading(false);
      return;
    }

    async function fetchArticleData() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await newsService.getNewsBySlug(articleSlug);
        const articleData = res.data;
        setArticle(articleData);
        console.log('articleData: ', articleData);
        // markArticleAsRead(Number(articleId));

        // Fetch contextual related articles scored by category, topic, and keyword relevance
        try {
          const relatedRes = await newsService.getRelatedNews(articleData.id, {
            limit: 3,
          });
          setRelatedNews(relatedRes.data || []);
        } catch {
          // Graceful fallback strategy: fetch top category articles if related endpoint fails
          const fallbackRes = await newsService.getNews({
            category: articleData?.category,
            limit: 6,
          });
          const filtered = (fallbackRes.data || [])
            .filter((item) => Number(item.id) !== Number(articleData.id))
            .slice(0, 3);
          setRelatedNews(filtered);
        }
      } catch {
        setError('Não foi possível carregar os detalhes desta notícia.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchArticleData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [articleSlug, markArticleAsRead]);

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
    ? bookmarkedArticleIds.has(Number(article.id))
    : false;

  return (
    <div className="min-vh-100 d-flex flex-column bg-body">
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
                  src={article.image_url}
                  alt={article.title}
                  className="img-fluid w-100 object-fit-cover article-cover-img"
                />
                <span
                  className={`badge bg-${article.badgeBg || 'primary'} position-absolute bottom-0 start-0 m-3 px-3 py-2 rounded-pill fs-6 shadow-sm`}
                >
                  {article.category}
                </span>
              </div>

              {/* Headline and lead summary header */}
              <header className="mb-4">
                <h1 className="fw-bold mb-3 article-title">{article.title}</h1>
                <p className="lead text-secondary mb-3 article-summary">
                  {article.summary}
                </p>

                {/* Article publication metadata and user action toolbar */}
                <div className="d-flex flex-wrap align-items-center justify-content-between py-3 border-top border-bottom gap-3 article-meta-bar">
                  <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
                    <span className="d-inline-flex align-items-center gap-1">
                      <IconClock size={18} className="text-muted" />
                      <time>{article.publishedTimeAgo || 'Há 2 horas'}</time>
                    </span>
                    <span className="d-inline-flex align-items-center gap-1">
                      <IconUser size={18} className="text-muted" />
                      <span>Por {article.author || 'Redação NewsHub'}</span>
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Link to={`${article.news_url}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary rounded-pill d-inline-flex align-items-center gap-1">
                      <IconLinkPlus size={16} />
                      <span>Acessar fonte original</span>
                    </Link>
                    <button
                      onClick={() => navigate(`${article.news_url}`)}
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
                {Array.isArray(article.content) ? (
                  article.content.map((paragraph, index) => (
                    <p key={index} className="mb-3 fs-5 lh-base">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="mb-3 fs-5 lh-base">{article.summary}</p>
                )}
              </section>
            </article>

            {/* Sidebar column presenting contextually related news recommendations */}
            <aside className="col-12 col-lg-4">
              <div className="sticky-lg-top" style={{ top: '90px' }}>
                <h2 className="h5 fw-bold mb-3 pb-2 border-bottom">
                  Notícias relacionadas
                </h2>

                <div className="d-flex flex-column gap-3">
                  {relatedNews.map((item) => (
                    <a
                      key={item.id}
                      href={`/news/${item.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/news/${item.slug}`);
                      }}
                      className="card border-0 shadow-sm rounded-3 overflow-hidden related-card text-decoration-none d-block"
                    >
                      <div className="card-body p-3 d-flex gap-3 align-items-center">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="rounded-3 object-fit-cover related-thumb"
                        />
                        <div className="d-flex flex-column justify-content-between min-w-0">
                          <span
                            className={`badge bg-${item.badgeBg || 'primary'} bg-opacity-10 text-${item.badgeBg || 'primary'} align-self-start mb-1 rounded-pill`}
                          >
                            {item.category}
                          </span>
                          <h3 className="h6 fw-semibold mb-1 text-truncate-2 text-body">
                            {item.title}
                          </h3>
                          <span className="text-secondary small d-inline-flex align-items-center gap-1">
                            <IconClock size={14} />
                            {item.publishedTimeAgo}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
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
