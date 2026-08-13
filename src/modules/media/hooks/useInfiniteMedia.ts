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
  seenMovies?: TMDBMediaItem[];
  seenTV?: TMDBMediaItem[];
}

export function useInfiniteMedia({
  filters,
  sessionId,
  accountId,
  watchlistMovies = [],
  watchlistTV = [],
  favoriteMovies = [],
  favoriteTV = [],
  seenMovies = [],
  seenTV = [],
}: UseInfiniteMediaProps) {
  // If quickFilter is active (watchlist, favorites, or seen), return from user's account state
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
        with_genres: filters.genreId || undefined,
        with_cast: filters.personId || undefined,
        with_original_language: filters.originalLanguage || undefined,
        certification_country: filters.certification ? (filters.certificationCountry || 'US') : undefined,
        certification: filters.certification || undefined,
      };

      // If 'all' media types selected, fetch both movies and TV series and interleave results
      if (filters.mediaType === 'all') {
        const [movieRes, tvRes] = await Promise.all([
          tmdbService.getDiscover('movie', discoverParams, pageParam).catch(() => null),
          tmdbService.getDiscover('tv', discoverParams, pageParam).catch(() => null),
        ]);

        const movies = (movieRes?.results || []).map((m) => ({ ...m, media_type: 'movie' as const }));
        const tvs = (tvRes?.results || []).map((t) => ({ ...t, media_type: 'tv' as const }));

        // Interleave movies and TV series
        const interleaved: TMDBMediaItem[] = [];
        const maxLen = Math.max(movies.length, tvs.length);
        for (let i = 0; i < maxLen; i++) {
          if (i < movies.length) interleaved.push(movies[i]);
          if (i < tvs.length) interleaved.push(tvs[i]);
        }

        return {
          page: pageParam,
          results: interleaved,
          total_pages: Math.max(movieRes?.total_pages || 1, tvRes?.total_pages || 1),
          total_results: (movieRes?.total_results || 0) + (tvRes?.total_results || 0),
        };
      }

      // Single mediaType discover endpoint
      const discoverRes = await tmdbService.getDiscover(
        filters.mediaType,
        discoverParams,
        pageParam
      );

      const defaultType: 'movie' | 'tv' = filters.mediaType === 'tv' ? 'tv' : 'movie';

      return {
        ...discoverRes,
        results: (discoverRes.results || []).map((item) => ({
          ...item,
          media_type: item.media_type || defaultType,
        })),
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages && lastPage.page < 500) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !isAccountListFilter,
  });

  // Handle local filtered account list if quickFilter is active
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
    } else if (filters.quickFilter === 'seen') {
      rawItems =
        filters.mediaType === 'movie'
          ? seenMovies.map((m) => ({ ...m, media_type: 'movie' as const }))
          : filters.mediaType === 'tv'
          ? seenTV.map((t) => ({ ...t, media_type: 'tv' as const }))
          : [
              ...seenMovies.map((m) => ({ ...m, media_type: 'movie' as const })),
              ...seenTV.map((t) => ({ ...t, media_type: 'tv' as const })),
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
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      filteredItems = filteredItems.filter((item) =>
        (item.title || item.name || '').toLowerCase().includes(q)
      );
    }

    return {
      items: filteredItems,
      isLoading: false,
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
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    fetchNextPage: infiniteQuery.fetchNextPage,
  };
}
