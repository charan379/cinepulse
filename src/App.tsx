import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService, TMDBMediaItem } from '@/lib/tmdb';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useUserLists } from '@/modules/lists/hooks/useUserLists';
import { useInfiniteMedia } from '@/modules/media/hooks/useInfiniteMedia';
import { useFiltersState } from '@/modules/filters/hooks/useFiltersState';
import { Navigation } from '@/components/Navigation';
import { TMDBLoginCard } from '@/modules/auth/components/TMDBLoginCard';
import { UserListsView } from '@/modules/lists/components/UserListsView';
import { CreateListModal } from '@/modules/lists/components/CreateListModal';
import { MediaCard } from '@/modules/media/components/MediaCard';
import { MediaHeroCarousel } from '@/modules/media/components/MediaHeroCarousel';
import { MediaDetailModal } from '@/modules/media/components/MediaDetailModal';
import { AdvancedFilterDrawer } from '@/modules/filters/components/AdvancedFilterDrawer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, TrendingUp, Star, Calendar, RefreshCw, AlertCircle, Bookmark } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'lists' | 'discover'>('home');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<TMDBMediaItem | null>(null);

  // Authentication
  const { isAuthenticated, sessionId, account, isLoading: isLoadingAuth, authError, login, logout } = useAuth();

  // User Custom Lists & Collections
  const {
    lists,
    watchlistMovies,
    watchlistTV,
    favoriteMovies,
    favoriteTV,
    seenMovies,
    seenTV,
    createList,
    isCreatingList,
    deleteList,
    toggleWatchlist,
    toggleFavorite,
    toggleSeen,
  } = useUserLists(account?.id, sessionId);

  // Advanced Filters State
  const { filters, isFiltered, updateFilter, setAllFilters, resetFilters } = useFiltersState();

  // Discover & Media Infinite Query
  const {
    items: discoverItems,
    isLoading: isLoadingDiscover,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteMedia({
    filters,
    sessionId,
    accountId: account?.id,
    watchlistMovies,
    watchlistTV,
    favoriteMovies,
    favoriteTV,
    seenMovies,
    seenTV,
  });

  // Home Screen Section Queries: Trending, Popular, Top Rated, Upcoming
  const { data: trendingData } = useQuery({
    queryKey: ['home-trending'],
    queryFn: () => tmdbService.getTrending('all', 'day'),
    staleTime: 1000 * 60 * 15,
  });

  const { data: popularMovies } = useQuery({
    queryKey: ['home-popular-movies'],
    queryFn: () => tmdbService.getPopular('movie'),
    staleTime: 1000 * 60 * 15,
  });

  const { data: topRatedMovies } = useQuery({
    queryKey: ['home-top-rated-movies'],
    queryFn: () => tmdbService.getTopRated('movie'),
    staleTime: 1000 * 60 * 15,
  });

  const { data: upcomingMovies } = useQuery({
    queryKey: ['home-upcoming-movies'],
    queryFn: () => tmdbService.getUpcomingMovies(),
    staleTime: 1000 * 60 * 15,
  });

  const trendingList = trendingData?.results || [];

  const userWatchlistItems: TMDBMediaItem[] = [
    ...watchlistMovies.map((m) => ({ ...m, media_type: 'movie' as const })),
    ...watchlistTV.map((t) => ({ ...t, media_type: 'tv' as const })),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Apple Compact Navigation Shell */}
      <Navigation
        currentTab={activeTab}
        onTabChange={(tab) => {
          resetFilters();
          setActiveTab(tab);
        }}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => {
          updateFilter('searchQuery', q);
          if (q.trim().length > 0) setActiveTab('discover');
        }}
        onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
        isAuthenticated={isAuthenticated}
        account={account}
        onLogin={login}
        onLogout={logout}
        isFiltered={isFiltered}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-6 pb-20 md:pb-8">
        {/* Auth status error banner if any */}
        {authError && (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Featured Hero Carousel */}
            {trendingList.length > 0 ? (
              <MediaHeroCarousel items={trendingList} onSelect={setSelectedMedia} />
            ) : (
              <Skeleton className="h-[320px] sm:h-[400px] w-full rounded-2xl" />
            )}

            {/* Continue Watching / My Watchlist Section for Logged-In Users */}
            {isAuthenticated && userWatchlistItems.length > 0 && (
              <section className="space-y-3 rounded-2xl border border-primary/25 bg-card/70 p-3.5 sm:p-4 backdrop-blur-md shadow-xs">
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
                    <Bookmark className="h-4.5 w-4.5 text-primary fill-primary/20" /> Continue Watching / My Watchlist
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateFilter('quickFilter', 'watchlist');
                      setActiveTab('discover');
                    }}
                    className="text-xs text-primary cursor-pointer h-7"
                  >
                    View All ({userWatchlistItems.length})
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                  {userWatchlistItems.slice(0, 10).map((item) => (
                    <MediaCard
                      key={`${item.media_type}-${item.id}`}
                      item={item}
                      sessionId={sessionId}
                      accountId={account?.id}
                      onSelect={setSelectedMedia}
                      onToggleWatchlist={toggleWatchlist}
                      onToggleFavorite={toggleFavorite}
                      onToggleSeen={toggleSeen}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Trending Now */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" /> Trending Today
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    updateFilter('mediaType', 'movie');
                    setActiveTab('discover');
                  }}
                  className="text-xs text-primary cursor-pointer h-7"
                >
                  View All
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                {trendingList.slice(0, 10).map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    sessionId={sessionId}
                    accountId={account?.id}
                    onSelect={setSelectedMedia}
                    onToggleWatchlist={toggleWatchlist}
                    onToggleFavorite={toggleFavorite}
                    onToggleSeen={toggleSeen}
                  />
                ))}
              </div>
            </section>

            {/* Popular Movies */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" /> Popular Movies
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                {(popularMovies?.results || []).slice(0, 10).map((item) => (
                  <MediaCard
                    key={item.id}
                    item={{ ...item, media_type: 'movie' }}
                    sessionId={sessionId}
                    accountId={account?.id}
                    onSelect={setSelectedMedia}
                    onToggleWatchlist={toggleWatchlist}
                    onToggleFavorite={toggleFavorite}
                    onToggleSeen={toggleSeen}
                  />
                ))}
              </div>
            </section>

            {/* Top Rated Movies */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> Top Rated Movies
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                {(topRatedMovies?.results || []).slice(0, 10).map((item) => (
                  <MediaCard
                    key={item.id}
                    item={{ ...item, media_type: 'movie' }}
                    sessionId={sessionId}
                    accountId={account?.id}
                    onSelect={setSelectedMedia}
                    onToggleWatchlist={toggleWatchlist}
                    onToggleFavorite={toggleFavorite}
                    onToggleSeen={toggleSeen}
                  />
                ))}
              </div>
            </section>

            {/* Upcoming Movies */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" /> Upcoming Releases
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                {(upcomingMovies?.results || []).slice(0, 10).map((item) => (
                  <MediaCard
                    key={item.id}
                    item={{ ...item, media_type: 'movie' }}
                    sessionId={sessionId}
                    accountId={account?.id}
                    onSelect={setSelectedMedia}
                    onToggleWatchlist={toggleWatchlist}
                    onToggleFavorite={toggleFavorite}
                    onToggleSeen={toggleSeen}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* My Lists & Collections Tab */}
        {activeTab === 'lists' && (
          <>
            {isAuthenticated ? (
              <UserListsView
                lists={lists}
                watchlistMovies={watchlistMovies}
                watchlistTV={watchlistTV}
                favoriteMovies={favoriteMovies}
                favoriteTV={favoriteTV}
                seenMovies={seenMovies}
                seenTV={seenTV}
                sessionId={sessionId}
                accountId={account?.id}
                onOpenCreateModal={() => setIsCreateListModalOpen(true)}
                onDeleteList={deleteList}
                onSelectMedia={setSelectedMedia}
                onToggleWatchlist={toggleWatchlist}
                onToggleFavorite={toggleFavorite}
                onToggleSeen={toggleSeen}
              />
            ) : (
              <TMDBLoginCard onLogin={login} isLoading={isLoadingAuth} error={authError} />
            )}
          </>
        )}

        {/* Discover & Infinite Search Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {filters.searchQuery ? `Search Results for "${filters.searchQuery}"` : 'Discover Titles'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {filters.mediaType === 'movie' ? 'Movies' : 'TV Series'}
                  {filters.genreId ? ' • Filtered by Genre' : ''}
                  {filters.certification ? ` • PG Rating: ${filters.certification}` : ''}
                </p>
              </div>

              {isFiltered && (
                <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs h-7 px-2.5 cursor-pointer">
                  <RefreshCw className="h-3.5 w-3.5" /> Clear Filters
                </Button>
              )}
            </div>

            {/* Media Grid */}
            {isLoadingDiscover ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] w-full rounded-xl" />
                ))}
              </div>
            ) : discoverItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                {discoverItems.map((item) => (
                  <MediaCard
                    key={`${item.media_type || filters.mediaType}-${item.id}`}
                    item={item}
                    sessionId={sessionId}
                    accountId={account?.id}
                    onSelect={setSelectedMedia}
                    onToggleWatchlist={toggleWatchlist}
                    onToggleFavorite={toggleFavorite}
                    onToggleSeen={toggleSeen}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center space-y-2 rounded-2xl border border-border bg-card p-8">
                <Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
                <h3 className="text-base font-bold text-foreground">No titles found</h3>
                <p className="text-xs text-muted-foreground">Try adjusting your filters or search keywords.</p>
                <Button variant="outline" size="sm" onClick={resetFilters} className="mt-2 text-xs">
                  Reset All Filters
                </Button>
              </div>
            )}

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full sm:w-64 text-xs font-semibold cursor-pointer"
                >
                  {isFetchingNextPage ? 'Loading more...' : 'Load More Titles'}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Advanced Filters Drawer */}
      <AdvancedFilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filters={filters}
        onApplyFilters={(draftFilters) => {
          setAllFilters(draftFilters);
          setActiveTab('discover');
        }}
        onResetFilters={resetFilters}
      />

      {/* Create Custom List Modal */}
      <CreateListModal
        isOpen={isCreateListModalOpen}
        onClose={() => setIsCreateListModalOpen(false)}
        onCreate={createList}
        isLoading={isCreatingList}
      />

      {/* Media Detail & Season Explorer Modal */}
      <MediaDetailModal
        key={selectedMedia?.id}
        item={selectedMedia}
        isOpen={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        sessionId={sessionId}
        accountId={account?.id}
        userLists={lists}
        onToggleWatchlist={toggleWatchlist}
        onToggleFavorite={toggleFavorite}
        onToggleSeen={toggleSeen}
        onSelectMedia={setSelectedMedia}
        onOpenCreateListModal={() => setIsCreateListModalOpen(true)}
      />
    </div>
  );
}
