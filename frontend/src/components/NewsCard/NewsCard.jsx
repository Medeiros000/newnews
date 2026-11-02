import { Component } from 'react';
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
import { timeElapsed } from '@/utils';

export { NewsSkeleton, HeroCardView as HeroCard } from './HeroCard';

/**
 * NewsCardView Class Component.
 * Pure UI presentation for standard news card item preserving original visual identity.
 */
export class NewsCardView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageError: false,
    };
  }

  handleImageError = () => {
    this.setState({ imageError: true });
  };

  handleBookmark = (e) => {
    e.stopPropagation();
    this.props.onToggleBookmark?.(this.props.article.id);
  };

  render() {
    const {
      article,
      isRead,
      isBookmarked,
      user,
      onSelectArticle,
    } = this.props;

    const { imageError } = this.state;

    if (!article) return null;

    const bookmarkLabel = isBookmarked
      ? 'Remover dos favoritos'
      : 'Salvar nos favoritos';

    const imageUrl = article.image_url || article.image;

    return (
      <Link
        to={'/news/' + article.slug}
        rel="noopener noreferrer"
        className="text-decoration-none text-reset"
      >
        <article
          id={`news-card-${article.id}`}
          className={`card h-100 border news-card shadow-sm overflow-hidden ${
            isRead ? 'news-card--read' : ''
          }`}
        >
          <div className="news-card-img-wrapper overflow-hidden position-relative">
            {/* Só mostra o botão se existir usuário logado */}
            {user && (
              <button
                type="button"
                className={`news-card-bookmark-btn ${
                  isBookmarked ? 'is-active' : ''
                }`}
                onClick={this.handleBookmark}
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

            {imageError || !imageUrl ? (
              <div className="w-100 h-100 bg-secondary-subtle d-flex align-items-center justify-content-center text-muted">
                <IconNews size={32} opacity={0.5} />
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={article.title}
                className="news-card-img w-100 h-100 object-fit-cover"
                loading="lazy"
                onError={this.handleImageError}
              />
            )}
          </div>

          <div className="card-body d-flex flex-column pb-2">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span
                className={`badge text-bg-${
                  article.badgeBg || 'primary'
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
                <span>{timeElapsed(article.published_at) || 'Recente'}</span>
              </div>

              <span className="btn btn-link btn-sm news-card-action p-0 pe-none">
                Ler mais <IconChevronRight size={12} className="ms-1" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }
}

/**
 * Standard news article card component.
 */
export function NewsCard({
  article,
  isRead,
  isBookmarked,
  onSelectArticle,
  onToggleBookmark,
}) {
  const user = useUserStore((state) => state.user);

  return (
    <NewsCardView
      article={article}
      isRead={isRead}
      isBookmarked={isBookmarked}
      user={user}
      onSelectArticle={onSelectArticle}
      onToggleBookmark={onToggleBookmark}
    />
  );
}
