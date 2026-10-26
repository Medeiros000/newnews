import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  IconBookmark,
  IconBookmarkFilled,
  IconClock,
  IconChevronRight,
  IconNews,
} from '@tabler/icons-react';

import { useUserStore } from '@/stores';

import './NewsCard.css';

/**
 * Standard news article card component.
 * Displays article thumbnail, title, summary, metadata (category, time),
 * and handles bookmark interactions if the user is authenticated.
 *
 * @param {Object} props
 * @param {Object} props.article - The article data object
 * @param {boolean} [props.isRead=false] - Whether the user has already read this article
 * @param {boolean} [props.isBookmarked=false] - Whether the user has bookmarked this article
 * @param {Function} [props.onSelectArticle] - Callback triggered when the article is clicked
 * @param {Function} [props.onToggleBookmark] - Callback triggered when the bookmark icon is clicked
 */
export function NewsCard({
  article,
  isRead,
  isBookmarked,
  onSelectArticle,
  onToggleBookmark,
}) {
  const [imageError, setImageError] = useState(false);

  // Global state for user context (to show/hide bookmark button)
  const user = useUserStore((state) => state.user);

  if (!article) return null;

  /**
   * Prevents event bubbling so clicking the bookmark button doesn't open the article
   */
  const handleBookmark = (e) => {
    e.stopPropagation();
    onToggleBookmark?.(article.id);
  };

  const bookmarkLabel = isBookmarked
    ? 'Remover dos favoritos'
    : 'Salvar nos favoritos';

  return (
    <>
      <Link to={'/news/' + article.slug} rel="noopener noreferrer" className="text-decoration-none text-reset">
        <article
          id={`news-card-${article.id}`}
          className={`card h-100 border news-card shadow-sm overflow-hidden ${isRead ? 'news-card--read' : ''
            }`}
        >
          <div className="news-card-img-wrapper overflow-hidden position-relative">
            {/* Só mostra o botão se existir usuário logado */}
            {user && (
              <button
                type="button"
                className={`news-card-bookmark-btn ${isBookmarked ? 'is-active' : ''
                  }`}
                onClick={handleBookmark}
                aria-label={bookmarkLabel}
                title={bookmarkLabel}
              >
                {isBookmarked ? (
                  <IconBookmarkFilled size={15} />
                ) : (
                  <IconBookmark size={15} />
                )}
              </button>
            )}

            {imageError ? (
              <div className="w-100 h-100 bg-secondary-subtle d-flex align-items-center justify-content-center text-muted">
                <IconNews size={32} opacity={0.5} />
              </div>
            ) : (
              <img
                src={article.image_url}
                alt={article.title}
                className="news-card-img w-100 h-100 object-fit-cover"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          <div className="card-body d-flex flex-column pb-2">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span
                className={`badge text-bg-${article.badgeBg || 'primary'
                  } align-self-start`}
              >
                {article.category}
              </span>

              {isRead && (
                <span className="badge text-bg-secondary badge-read align-self-start">
                  ✓ Lido
                </span>
              )}
            </div>

            <h2 className="card-title news-card-title fw-bold mb-2">
              <button
                type="button"
                className="btn btn-link p-0 text-start text-reset text-decoration-none fw-bold stretched-link w-100"
                onClick={() => onSelectArticle?.(article)}
              >
                {article.title}
              </button>
            </h2>

            <p className="card-text text-secondary news-card-summary mb-3">
              {article.summary}
            </p>

            <div className="d-flex align-items-center justify-content-between mt-auto">
              <div className="d-flex align-items-center gap-1 text-secondary news-card-time">
                <IconClock size={13} />
                <span>{article.publishedTimeAgo || 'Recente'}</span>
              </div>

              <span className="btn btn-link btn-sm news-card-action p-0 pe-none">
                Ler mais <IconChevronRight size={12} className="ms-1" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    </>
  );
}

/**
 * Featured 'Hero' news card component.
 * Displays a large, full-bleed image with overlay text for top-tier articles.
 *
 * @param {Object} props
 * @param {Object} props.article - The featured article data object
 * @param {Function} [props.onSelectArticle] - Callback triggered when the article is clicked
 */
export function HeroCard({ article, onSelectArticle }) {
  const [imageError, setImageError] = useState(false);

  if (!article) return null;

  const handleSelect = () => onSelectArticle?.(article);

  return (
    <div
      id="hero-card"
      className="hero-card rounded-4 overflow-hidden position-relative mb-4"
    >
      {imageError ? (
        <div className="w-100 h-100 bg-secondary-subtle d-flex align-items-center justify-content-center text-muted">
          <IconNews size={48} opacity={0.5} />
        </div>
      ) : (
        <img
          src={article.image}
          alt={article.title}
          className="w-100 h-100 object-fit-cover"
          loading="eager"
          onError={() => setImageError(true)}
        />
      )}

      <div className="hero-overlay position-absolute bottom-0 start-0 w-100 p-4 d-flex flex-column justify-content-end">
        <span
          className={`badge text-bg-${article.badgeBg || 'primary'
            } align-self-start mb-2`}
        >
          {article.category}
        </span>

        <h2 className="text-white fw-bold mb-2 hero-card-title">
          <button
            type="button"
            className="btn btn-link p-0 text-start text-white text-decoration-none fw-bold stretched-link w-100 hero-card-title-btn"
            onClick={handleSelect}
          >
            {article.title}
          </button>
        </h2>

        <p className="text-white text-opacity-75 mb-3 d-none d-sm-block hero-card-summary">
          {article.summary}
        </p>

        <div className="d-flex align-items-center gap-3">
          <span className="text-white text-opacity-50 news-card-time">
            {article.publishedTimeAgo || 'Recente'}
          </span>

          <span className="btn btn-light btn-sm rounded-pill fw-semibold px-3 pe-none">
            Ler mais
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton component for the news feed.
 * Displays placeholder animations while articles are being fetched.
 *
 * @param {Object} props
 * @param {number} [props.skeletonCount=6] - Number of standard card skeletons to render
 * @param {boolean} [props.shouldShowHero=false] - Whether to render a large hero card skeleton at the top
 */
export function NewsSkeleton({ skeletonCount = 6, shouldShowHero = false }) {
  return (
    <>
      {shouldShowHero && (
        <div className="hero-card rounded-4 overflow-hidden mb-4 p-4 border d-flex flex-column justify-content-end placeholder-glow">
          <span
            className="placeholder col-2 rounded-pill mb-2"
            style={{ height: 20 }}
          />

          <span
            className="placeholder col-8 rounded mb-2"
            style={{ height: 32 }}
          />

          <span
            className="placeholder col-6 rounded mb-3"
            style={{ height: 18 }}
          />

          <div className="d-flex align-items-center gap-3">
            <span
              className="placeholder col-2 rounded"
              style={{ height: 16 }}
            />

            <span
              className="placeholder col-3 rounded-pill"
              style={{ height: 32 }}
            />
          </div>
        </div>
      )}

      <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div key={index} className="col">
            <div className="card h-100 border shadow-sm placeholder-glow">
              <div
                className="placeholder w-100 rounded-top"
                style={{ height: 176 }}
              />

              <div className="card-body d-flex flex-column p-3">
                <span
                  className="placeholder col-3 rounded-pill mb-2"
                  style={{ height: 20 }}
                />

                <span
                  className="placeholder col-10 rounded mb-2"
                  style={{ height: 20 }}
                />

                <span
                  className="placeholder col-8 rounded mb-3"
                  style={{ height: 16 }}
                />

                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <span
                    className="placeholder col-3 rounded"
                    style={{ height: 14 }}
                  />

                  <span
                    className="placeholder col-3 rounded"
                    style={{ height: 14 }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
