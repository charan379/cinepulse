import { useInfiniteQuery } from '@tanstack/react-query';
import { tmdbService, TMDBMediaItem, PaginatedResponse } from '@/lib/tmdb';
import { FilterState } from '@/modules/filters/hooks/useFiltersState';

interface UseInfiniteMediaProps {
  filters: FilterState;
  sessionId?: string | null;
  accountId?: number | null;
  watchlistMovies?: TMDBMediaItem[];
  watchlistTV?: TMDBMediaItem[];
  favoriteMovies?: TMDBMediaItem[];
  favoriteTV?: TMDBMediaItem[];
}

export function useInfiniteMedia({
  filters,
  sessionId,
  accountId,
  watchlistMovies = [],
  watchlistTV = [],
  favoriteMovies = [],
  favoriteTV = [],
}: UseInfiniteMediaProps) {
  // If quickFilter is active (watchlist or favorites), return from user's account state
  const isAccountListFilter = filters.quickFilter !== 'all';

  const queryKey = [
    'infinite-media',
    filters.mediaType,
    filters.quickFilter,
    filters.genreId,
    filters.personId,
    filters.originalLanguage,
    filters.certificationCountry,
    filters.certification,
    filters.sortBy,
    filters.searchQuery,
  ];

  const infiniteQuery = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }): Promise<PaginatedResponse<TMDBMediaItem>> => {
      // If user typed a search query
      if (filters.searchQuery.trim().length > 0) {
        const searchRes = await tmdbService.searchMulti(filters.searchQuery, pageParam);
        return {
          ...searchRes,
          results: (searchRes.results || []).map((item) => ({
            ...item,
            media_type: item.media_type || (item.title ? 'movie' : 'tv'),
          })),
        };
      }

      const discoverParams = {
        sort_by: filters.sortBy || 'popularity.desc',
        with_genres: filters.genreId ? String(filters.genreId) : undefined,
        with_people: filters.personId ? String(filters.personId) : undefined,
        with_original_language: filters.originalLanguage || undefined,
        certification_country: filters.certification ? filters.certificationCountry : undefined,
        certification: filters.certification || undefined,
      };

      if (filters.mediaType === 'movie') {
        const res = await tmdbService.discoverMovies(pageParam, discoverParams);
        return {
          ...res,
          results: res.results.map((m) => ({ ...m, media_type: 'movie' as const })),
        };
      } else if (filters.mediaType === 'tv') {
        const res = await tmdbService.discoverTV(pageParam, discoverParams);
        return {
          ...res,
          results: res.results.map((t) => ({ ...t, media_type: 'tv' as const })),
        };
      } else {
        // 'all': fetch pageParam for movies & tv and merge
        const [moviesRes, tvRes] = await Promise.all([
          tmdbService.discoverMovies(pageParam, discoverParams),
          tmdbService.discoverTV(pageParam, discoverParams),
        ]);

        const merged = [
          ...moviesRes.results.map((m) => ({ ...m, media_type: 'movie' as const })),
          ...tvRes.results.map((t) => ({ ...t, media_type: 'tv' as const })),
        ];

        // Sort combined results by popularity or vote_average
        merged.sort((a, b) => {
          if (filters.sortBy.includes('vote_average')) {
            return (b.vote_average || 0) - (a.vote_average || 0);
          }
          return (b.popularity || 0) - (a.popularity || 0);
        });

        return {
          page: pageParam,
          results: merged,
          total_pages: Math.max(moviesRes.total_pages, tvRes.total_pages),
          total_results: moviesRes.total_results + tvRes.total_results,
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages && lastPage.page < 500) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !isAccountListFilter,
  });

  // If viewing account list (watchlist or favorites)
  if (isAccountListFilter) {
    let rawItems: TMDBMediaItem[] = [];
    if (filters.quickFilter === 'watchlist') {
      rawItems =
        filters.mediaType === 'movie'
          ? watchlistMovies.map((m) => ({ ...m, media_type: 'movie' as const }))
          : filters.mediaType === 'tv'
          ? watchlistTV.map((t) => ({ ...t, media_type: 'tv' as const }))
          : [
              ...watchlistMovies.map((m) => ({ ...m, media_type: 'movie' as const })),
              ...watchlistTV.map((t) => ({ ...t, media_type: 'tv' as const })),
            ];
    } else if (filters.quickFilter === 'favorites') {
      rawItems =
        filters.mediaType === 'movie'
          ? favoriteMovies.map((m) => ({ ...m, media_type: 'movie' as const }))
          : filters.mediaType === 'tv'
          ? favoriteTV.map((t) => ({ ...t, media_type: 'tv' as const }))
          : [
              ...favoriteMovies.map((m) => ({ ...m, media_type: 'movie' as const })),
              ...favoriteTV.map((t) => ({ ...t, media_type: 'tv' as const })),
            ];
    }

    // Apply additional in-memory genre/language/mediaType filtering
    let filteredItems = rawItems.map((item) => ({
      ...item,
      media_type: item.media_type || (item.title ? ('movie' as const) : ('tv' as const)),
    }));

    if (filters.genreId !== null) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.genre_ids?.includes(filters.genreId!) ||
          item.genres?.some((g) => g.id === filters.genreId)
      );
    }
    if (filters.originalLanguage) {
      filteredItems = filteredItems.filter(
        (item) => item.original_language === filters.originalLanguage
      );
    }
    if (filters.certification) {
      filteredItems = filteredItems.filter(
        (item) => item.certification === filters.certification
      );
    }
    if (filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase();
      filteredItems = filteredItems.filter((item) => {
        const title = (item.title || item.name || '').toLowerCase();
        return title.includes(q);
      });
    }

    return {
      items: filteredItems,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve(),
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: () => {},
    };
  }

  let items = infiniteQuery.data?.pages.flatMap((page) => page.results) || [];

  // Enforce language & genre filters client-side to guarantee 100% precision
  if (filters.originalLanguage) {
    items = items.filter((item) => item.original_language === filters.originalLanguage);
  }
  if (filters.genreId !== null) {
    items = items.filter(
      (item) =>
        item.genre_ids?.includes(filters.genreId!) ||
        item.genres?.some((g) => g.id === filters.genreId)
    );
  }
  if (filters.mediaType !== 'all') {
    items = items.filter((item) => item.media_type === filters.mediaType);
  }

  return {
    items,
    isLoading: infiniteQuery.isLoading,
    isError: infiniteQuery.isError,
    error: infiniteQuery.error,
    refetch: infiniteQuery.refetch,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
  };
}
