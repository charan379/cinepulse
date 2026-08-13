import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tmdbService, TMDBList, TMDBMediaItem } from '@/lib/tmdb';

export function useUserLists(accountId?: number | null, sessionId?: string | null) {
  const queryClient = useQueryClient();

  const enabled = !!accountId && !!sessionId;

  // Custom User Lists Overview
  const listsQuery = useQuery({
    queryKey: ['user-lists', accountId, sessionId],
    queryFn: () => tmdbService.getUserLists(accountId!, sessionId!),
    enabled,
  });

  // Watchlist Movies & TV (Single Page 1 Fetch)
  const watchlistMoviesQuery = useQuery({
    queryKey: ['watchlist-movies', accountId, sessionId],
    queryFn: () => tmdbService.getWatchlist(accountId!, sessionId!, 'movies', 1),
    enabled,
  });

  const watchlistTVQuery = useQuery({
    queryKey: ['watchlist-tv', accountId, sessionId],
    queryFn: () => tmdbService.getWatchlist(accountId!, sessionId!, 'tv', 1),
    enabled,
  });

  // Favorites Movies & TV (Single Page 1 Fetch)
  const favoriteMoviesQuery = useQuery({
    queryKey: ['favorite-movies', accountId, sessionId],
    queryFn: () => tmdbService.getFavorites(accountId!, sessionId!, 'movies', 1),
    enabled,
  });

  const favoriteTVQuery = useQuery({
    queryKey: ['favorite-tv', accountId, sessionId],
    queryFn: () => tmdbService.getFavorites(accountId!, sessionId!, 'tv', 1),
    enabled,
  });

  // Rated/Seen Movies & TV (Single Page 1 Fetch)
  const ratedMoviesQuery = useQuery({
    queryKey: ['rated-movies', accountId, sessionId],
    queryFn: () => tmdbService.getRated(accountId!, sessionId!, 'movies', 1),
    enabled,
  });

  const ratedTVQuery = useQuery({
    queryKey: ['rated-tv', accountId, sessionId],
    queryFn: () => tmdbService.getRated(accountId!, sessionId!, 'tv', 1),
    enabled,
  });

  // Create Custom List Mutation
  const createListMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      tmdbService.createList(sessionId!, name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-lists', accountId, sessionId] });
    },
  });

  // Delete Custom List Mutation
  const deleteListMutation = useMutation({
    mutationFn: (listId: number) => tmdbService.deleteList(sessionId!, listId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-lists', accountId, sessionId] });
    },
  });

  // Toggle Watchlist Mutation
  const toggleWatchlistMutation = useMutation({
    mutationFn: ({ mediaType, mediaId, watchlist }: { mediaType: 'movie' | 'tv'; mediaId: number; watchlist: boolean }) =>
      tmdbService.toggleWatchlist(accountId!, sessionId!, mediaType, mediaId, watchlist),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['watchlist-movies', accountId, sessionId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist-tv', accountId, sessionId] });
      queryClient.invalidateQueries({ queryKey: ['account-state', variables.mediaType, variables.mediaId] });
    },
  });

  // Toggle Favorite Mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ mediaType, mediaId, favorite }: { mediaType: 'movie' | 'tv'; mediaId: number; favorite: boolean }) =>
      tmdbService.toggleFavorite(accountId!, sessionId!, mediaType, mediaId, favorite),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-movies', accountId, sessionId] });
      queryClient.invalidateQueries({ queryKey: ['favorite-tv', accountId, sessionId] });
      queryClient.invalidateQueries({ queryKey: ['account-state', variables.mediaType, variables.mediaId] });
    },
  });

  // Toggle Seen/Rated Mutation
  const toggleSeenMutation = useMutation({
    mutationFn: ({ mediaType, mediaId, isSeen }: { mediaType: 'movie' | 'tv'; mediaId: number; isSeen: boolean }) => {
      if (isSeen) {
        return tmdbService.rateMedia(sessionId!, mediaType, mediaId, 10);
      } else {
        return tmdbService.deleteRating(sessionId!, mediaType, mediaId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rated-movies', accountId, sessionId] });
      queryClient.invalidateQueries({ queryKey: ['rated-tv', accountId, sessionId] });
      queryClient.invalidateQueries({ queryKey: ['account-state', variables.mediaType, variables.mediaId] });
    },
  });

  const lists: TMDBList[] = listsQuery.data?.results || [];
  const watchlistMovies: TMDBMediaItem[] = watchlistMoviesQuery.data?.results || [];
  const watchlistTV: TMDBMediaItem[] = watchlistTVQuery.data?.results || [];
  const favoriteMovies: TMDBMediaItem[] = favoriteMoviesQuery.data?.results || [];
  const favoriteTV: TMDBMediaItem[] = favoriteTVQuery.data?.results || [];
  const seenMovies: TMDBMediaItem[] = ratedMoviesQuery.data?.results || [];
  const seenTV: TMDBMediaItem[] = ratedTVQuery.data?.results || [];

  return {
    lists,
    watchlistMovies,
    watchlistTV,
    favoriteMovies,
    favoriteTV,
    seenMovies,
    seenTV,
    watchlistTotalPages: Math.max(watchlistMoviesQuery.data?.total_pages || 1, watchlistTVQuery.data?.total_pages || 1),
    favoriteTotalPages: Math.max(favoriteMoviesQuery.data?.total_pages || 1, favoriteTVQuery.data?.total_pages || 1),
    seenTotalPages: Math.max(ratedMoviesQuery.data?.total_pages || 1, ratedTVQuery.data?.total_pages || 1),
    isLoading: listsQuery.isLoading || watchlistMoviesQuery.isLoading,
    isCreatingList: createListMutation.isPending,
    createList: (name: string, description: string = '') =>
      createListMutation.mutateAsync({ name, description }),
    deleteList: deleteListMutation.mutateAsync,
    toggleWatchlist: toggleWatchlistMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    toggleSeen: toggleSeenMutation.mutateAsync,
  };
}
