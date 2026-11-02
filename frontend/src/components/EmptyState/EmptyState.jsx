import { Component } from 'react';

/**
 * EmptyState Class Component.
 * Clean, separated class component providing feedback when lists are empty.
 */
export class EmptyState extends Component {
  render() {
    const {
      searchQuery,
      isSavedTabActive,
      category,
      onClearSearch,
      onResetCategory,
    } = this.props;

    const hasActiveSearch = Boolean(searchQuery);

    return (
      <div className="text-center py-5 px-3">
        <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle bg-secondary bg-opacity-10 text-secondary mb-3">
          {isSavedTabActive ? (
            <span style={{ fontSize: '2rem' }}>🔖</span>
          ) : hasActiveSearch ? (
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          ) : (
            <svg
              width="32"
              height="32"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          )}
        </div>
        <p className="fw-bold fs-5 mb-1">
          {isSavedTabActive
            ? 'Nenhum artigo salvo ainda'
            : hasActiveSearch
              ? `Nenhum resultado para "${searchQuery}"`
              : category
                ? `Sem notícias em ${category}`
                : 'Nenhuma notícia encontrada'}
        </p>
        <p
          className="text-secondary mx-auto mb-3"
          style={{ maxWidth: 420, fontSize: '0.9rem' }}
        >
          {isSavedTabActive
            ? 'Clique no ícone de marcador nas notícias para salvá-las aqui e ler mais tarde.'
            : hasActiveSearch
              ? 'Tente palavras-chave diferentes ou verifique a ortografia.'
              : 'Ainda não temos manchetes nesta seção. Explore outros tópicos.'}
        </p>
        {hasActiveSearch && (
          <button
            type="button"
            className="btn btn-outline-primary btn-sm rounded-pill px-3"
            onClick={onClearSearch}
          >
            Limpar busca
          </button>
        )}
        {!hasActiveSearch && !isSavedTabActive && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
            onClick={onResetCategory}
          >
            Ver todas as notícias
          </button>
        )}
      </div>
    );
  }
}
