import { useState, useEffect, useMemo, useCallback } from 'react';
import { newsService } from '@/services';
import { APP_CONFIG } from '@/utils';

/**
 * Custom hook for fetching and managing the news feed state.
 * Handles initial loading, pagination (load more), category filtering,
 * search queries, and the hero article for the default feed view.
 *
 * @param {Object} params
 * @param {string|null} params.navSelectedCategory - The currently selected nav category ID
 * @param {string} params.searchQuery - The debounced search query string
 * @param {Set} params.bookmarkedArticleIds - Set of bookmarked article IDs for filtering the saved tab
 *
 * @returns {Object} Feed state and action handlers
 */
export function useNewsFeed({
  navSelectedCategory,
  searchQuery,
  bookmarkedArticleIds,
}) {
  const [categories, setCategories] = useState(['Todos']);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [articlesList, setArticlesList] = useState([]);
  const [heroArticle, setHeroArticle] = useState(null);
  const [heroArticles, setHeroArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreArticles, setHasMoreArticles] = useState(false);
  const [error, setError] = useState(null);
  const [loadingState, setLoadingState] = useState({
    initial: true,
    more: false,
  });

  // Fetch dynamic categories from the news API
  useEffect(() => {
    let isMounted = true;
    async function loadMetaData() {
      try {
        const res = await newsService.getCategories();
        if (isMounted && res.success) {
          const list = res.data || [];
          setCategories(['Todos', ...list.map((c) => c.name)]);
        }
      } catch (err) {
        console.error('Failed to load dynamic categories:', err);
      }
    }
    loadMetaData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Build a unified set of valid categories from API data
  const validCategoriesSet = useMemo(() => new Set(categories), [categories]);

  const isSavedTabActive = navSelectedCategory === 'salvos';

  // Derive the effective category from the nav selection or local state
  const effectiveCategory = isSavedTabActive
    ? 'Salvos'
    : validCategoriesSet.has(navSelectedCategory)
      ? navSelectedCategory
      : activeCategory;

  const cleanQuery = searchQuery.trim();

  // True when no search and no category filter are applied
  const isDefaultFeed =
    effectiveCategory === 'Todos' && !cleanQuery && !isSavedTabActive;

  /**
   * Fetches a page of articles from the API.
   * Supports both initial loads and "load more" pagination.
   * Uses AbortController signals to cancel in-flight requests on re-renders.
   *
   * @param {number} targetPage - The page number to fetch
   * @param {boolean} [isLoadMore=false] - Whether to append to the existing list
   * @param {AbortSignal} [signal] - AbortController signal for cancellation
   */
  const fetchArticlesPage = useCallback(
    async (targetPage, isLoadMore = false, signal) => {
      setLoadingState(() => ({
        initial: !isLoadMore,
        more: isLoadMore,
      }));
      if (!isLoadMore) setError(null);

      try {
        const res = await newsService.getNews({
          category: isSavedTabActive ? 'Todos' : effectiveCategory,
          query: cleanQuery,
          page: targetPage,
          limit: APP_CONFIG.DEFAULT_PAGE_LIMIT,
        });

        if (signal?.aborted) return;

        if (res.success) {
          const list = res.data || [];

          // Append to list on "load more", replace on fresh load
          setArticlesList((prev) => (isLoadMore ? [...prev, ...list] : list));
          setPage(targetPage);
          const pagination = res.pagination;
          const hasMore = pagination
            ? pagination.page < pagination.totalPages
            : false;
          setHasMoreArticles(hasMore);

          // The top articles in the default feed are spotlighted in the hero carousel
          if (!isLoadMore && isDefaultFeed) {
            setHeroArticle(list[0] || null);
            setHeroArticles(list.slice(0, 5));
          }
        }
      } catch (err) {
        if (!signal?.aborted) {
          setError(err.message || 'Failed to load articles.');
        }
      } finally {
        if (!signal?.aborted) {
          setLoadingState({ initial: false, more: false });
        }
      }
    },
    [effectiveCategory, cleanQuery, isSavedTabActive, isDefaultFeed],
  );

  // Re-fetch articles whenever the effective filters change
  useEffect(() => {
    const controller = new AbortController();
    fetchArticlesPage(1, false, controller.signal);
    return () => controller.abort();
  }, [fetchArticlesPage]);

  // For the saved tab, filter articles to only those that are bookmarked
  const displayArticles = useMemo(() => {
    if (isSavedTabActive) {
      return articlesList.filter((a) => bookmarkedArticleIds.has(a.id));
    }
    return articlesList;
  }, [articlesList, isSavedTabActive, bookmarkedArticleIds]);

  // Only show the hero card on the default feed with trending articles
  const shouldShowHero = Boolean(isDefaultFeed && (heroArticles.length > 0 || heroArticle));

  // Exclude the hero articles from the grid to avoid duplication
  const gridArticles = useMemo(() => {
    if (!shouldShowHero) return displayArticles;
    const heroIds = new Set(
      heroArticles.length > 0
        ? heroArticles.map((a) => a.id)
        : heroArticle
          ? [heroArticle.id]
          : [],
    );
    return displayArticles.filter((a) => !heroIds.has(a.id));
  }, [displayArticles, heroArticles, heroArticle, shouldShowHero]);

  // Human-readable summary shown below the search bar or saved tab header
  const searchResultsSummary = useMemo(() => {
    const count = displayArticles.length;
    if (cleanQuery)
      return `${count} resultado${count !== 1 ? 's' : ''} para "${cleanQuery}"`;
    if (isSavedTabActive)
      return `${count} artigo${count !== 1 ? 's' : ''} salvo${count !== 1 ? 's' : ''}`;
    return null;
  }, [cleanQuery, isSavedTabActive, displayArticles.length]);

  return {
    categories,
    articlesList,
    gridArticles,
    heroArticle,
    heroArticles,
    isLoading: loadingState.initial,
    isLoadingMore: loadingState.more,
    error,
    page,
    hasMoreArticles,
    isSavedTabActive,
    effectiveCategory,
    shouldShowHero,
    searchResultsSummary,
    setActiveCategory,
    reloadNewsFeed: () => fetchArticlesPage(1, false),
    loadMoreArticles: () => fetchArticlesPage(page + 1, true),
  };
}
