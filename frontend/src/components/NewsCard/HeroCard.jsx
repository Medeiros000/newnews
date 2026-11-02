import { Component } from 'react';
import { IconNews } from '@tabler/icons-react';

/**
 * NewsSkeleton Class Component.
 * Placeholder shimmer cards while articles are being fetched.
 */
export class NewsSkeleton extends Component {
  render() {
    const { skeletonCount = 6, shouldShowHero = false } = this.props;

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
}

/**
 * HeroCardView Class Component.
 * Featured Hero spotlight article presentation.
 */
export class HeroCardView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageError: false,
    };
  }

  handleImageError = () => {
    this.setState({ imageError: true });
  };

  render() {
    const { article, onSelectArticle } = this.props;
    const { imageError } = this.state;

    if (!article) return null;

    const handleSelect = () => onSelectArticle?.(article);
    const imageUrl = article.image || article.image_url;

    return (
      <div
        id="hero-card"
        className="hero-card rounded-4 overflow-hidden position-relative mb-4"
      >
        {imageError || !imageUrl ? (
          <div className="w-100 h-100 bg-secondary-subtle d-flex align-items-center justify-content-center text-muted">
            <IconNews size={48} opacity={0.5} />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={article.title}
            className="w-100 h-100 object-fit-cover"
            loading="eager"
            onError={this.handleImageError}
          />
        )}

        <div className="hero-overlay position-absolute bottom-0 start-0 w-100 p-4 d-flex flex-column justify-content-end">
          <span
            className={`badge text-bg-${
              article.badgeBg || 'primary'
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
}
