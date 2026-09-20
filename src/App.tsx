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
import { QueryPlaceholder } from '@/components/QueryPlaceholder';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Star, Calendar, RefreshCw, AlertCircle, Bookmark, LayoutGrid, List } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'lists' | 'discover'>('home');
  const [listsSubTab, setListsSubTab] = useState<'custom' | 'watchlist' | 'favorites'>('custom');
  const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'table'>('grid');
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
    createList,
    isCreatingList,
    deleteList,
    toggleWatchlist,
    toggleFavorite,
  } = useUserLists(account?.id, sessionId);

  // Advanced Filters State
  const { filters, isFiltered, updateFilter, setAllFilters, resetFilters } = useFiltersState();

  // Discover & Media Infinite Query
  const {
    items: discoverItems,
    isLoading: isLoadingDiscover,
    isError: isErrorDiscover,
    error: errorDiscover,
    refetch: refetchDiscover,
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
  });

  // Home Screen Section Queries: Trending, Popular, Top Rated, Upcoming
  const trendingQuery = useQuery({
    queryKey: ['home-trending'],
    queryFn: () => tmdbService.getTrending('all', 'day'),
    staleTime: 1000 * 60 * 15,
  });

  const popularMoviesQuery = useQuery({
    queryKey: ['home-popular-movies'],
    queryFn: () => tmdbService.getPopular('movie'),
    staleTime: 1000 * 60 * 15,
  });

  const topRatedMoviesQuery = useQuery({
    queryKey: ['home-top-rated-movies'],
    queryFn: () => tmdbService.getTopRated('movie'),
    staleTime: 1000 * 60 * 15,
  });

  const upcomingMoviesQuery = useQuery({
    queryKey: ['home-upcoming-movies'],
    queryFn: () => tmdbService.getUpcomingMovies(),
    staleTime: 1000 * 60 * 15,
  });

  const trendingList = trendingQuery.data?.results || [];

  const userWatchlistItems: TMDBMediaItem[] = [
    ...watchlistMovies.map((m) => ({ ...m, media_type: 'movie' as const })),
    ...watchlistTV.map((t) => ({ ...t, media_type: 'tv' as const })),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-150">
      {/* Main Top Navigation Header */}
      <Navigation
        currentTab={activeTab}
        onTabChange={(tab, subTab) => {
          resetFilters();
          setActiveTab(tab);
          if (subTab) {
            setListsSubTab(subTab);
          }
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-5 pb-20 md:pb-8">
        {/* Auth status error banner if any */}
        {authError && (
          <div className="flex items-center gap-2 rounded border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-5">
            {/* Featured Hero Spotlight with QueryPlaceholder */}
            <QueryPlaceholder
              isLoading={trendingQuery.isLoading}
              isError={trendingQuery.isError}
              error={trendingQuery.error}
              isEmpty={!trendingQuery.isLoading && trendingList.length === 0}
              onRetry={() => trendingQuery.refetch()}
              onReload={() => trendingQuery.refetch()}
              loadingText="Loading featured spotlight titles..."
              errorTitle="Failed to load featured spotlight"
              emptyTitle="No featured titles available"
            >
              {trendingList.length > 0 && (
                <MediaHeroCarousel items={trendingList} onSelect={setSelectedMedia} />
              )}
            </QueryPlaceholder>

            {/* Watchlist Section for Logged-In Users */}
            {isAuthenticated && (
              <section className="space-y-3 rounded border border-border bg-card p-3 sm:p-4 card-outline-primary shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                    <Bookmark className="h-4 w-4 text-primary" /> My Watchlist
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

                <QueryPlaceholder
                  isEmpty={userWatchlistItems.length === 0}
                  onReload={() => {
                    updateFilter('quickFilter', 'watchlist');
                    setActiveTab('discover');
                  }}
                  actionText="Browse Catalog"
                  emptyTitle="Watchlist is empty"
                  emptyDescription="You haven't saved any movies or TV series to your watchlist yet."
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                    {userWatchlistItems.slice(0, 10).map((item) => (
                      <MediaCard
                        key={`${item.media_type}-${item.id}`}
                        item={item}
                        sessionId={sessionId}
                        accountId={account?.id}
                        onSelect={setSelectedMedia}
                        onToggleWatchlist={toggleWatchlist}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>
                </QueryPlaceholder>
              </section>
            )}

            {/* Trending Today */}
            <section className="space-y-3 rounded border border-border bg-card p-3 sm:p-4 card-outline-info shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[#17a2b8]" /> Trending Today
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    updateFilter('mediaType', 'all');
                    setActiveTab('discover');
                  }}
                  className="text-xs text-primary cursor-pointer h-7"
                >
                  View All
                </Button>
              </div>

              <QueryPlaceholder
                isLoading={trendingQuery.isLoading}
                isError={trendingQuery.isError}
                error={trendingQuery.error}
                isEmpty={!trendingQuery.isLoading && trendingList.length === 0}
                onRetry={() => trendingQuery.refetch()}
                onReload={() => trendingQuery.refetch()}
                loadingText="Loading trending titles..."
                errorTitle="Failed to load trending titles"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {trendingList.slice(0, 10).map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      sessionId={sessionId}
                      accountId={account?.id}
                      onSelect={setSelectedMedia}
                      onToggleWatchlist={toggleWatchlist}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </QueryPlaceholder>
            </section>

            {/* Popular Movies */}
            <section className="space-y-3 rounded border border-border bg-card p-3 sm:p-4 card-outline-secondary shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" /> Popular Movies
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

              <QueryPlaceholder
                isLoading={popularMoviesQuery.isLoading}
                isError={popularMoviesQuery.isError}
                error={popularMoviesQuery.error}
                isEmpty={!popularMoviesQuery.isLoading && (!popularMoviesQuery.data?.results || popularMoviesQuery.data.results.length === 0)}
                onRetry={() => popularMoviesQuery.refetch()}
                onReload={() => popularMoviesQuery.refetch()}
                loadingText="Loading popular movies..."
                errorTitle="Failed to load popular movies"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {(popularMoviesQuery.data?.results || []).slice(0, 10).map((item) => (
                    <MediaCard
                      key={item.id}
                      item={{ ...item, media_type: 'movie' }}
                      sessionId={sessionId}
                      accountId={account?.id}
                      onSelect={setSelectedMedia}
                      onToggleWatchlist={toggleWatchlist}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </QueryPlaceholder>
            </section>

            {/* Top Rated Movies */}
            <section className="space-y-3 rounded border border-border bg-card p-3 sm:p-4 card-outline-warning shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-[#ffc107] fill-current" /> Top Rated Movies
                </h2>
              </div>

              <QueryPlaceholder
                isLoading={topRatedMoviesQuery.isLoading}
                isError={topRatedMoviesQuery.isError}
                error={topRatedMoviesQuery.error}
                isEmpty={!topRatedMoviesQuery.isLoading && (!topRatedMoviesQuery.data?.results || topRatedMoviesQuery.data.results.length === 0)}
                onRetry={() => topRatedMoviesQuery.refetch()}
                onReload={() => topRatedMoviesQuery.refetch()}
                loadingText="Loading top rated movies..."
                errorTitle="Failed to load top rated movies"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {(topRatedMoviesQuery.data?.results || []).slice(0, 10).map((item) => (
                    <MediaCard
                      key={item.id}
                      item={{ ...item, media_type: 'movie' }}
                      sessionId={sessionId}
                      accountId={account?.id}
                      onSelect={setSelectedMedia}
                      onToggleWatchlist={toggleWatchlist}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </QueryPlaceholder>
            </section>

            {/* Upcoming Releases */}
            <section className="space-y-3 rounded border border-border bg-card p-3 sm:p-4 card-outline-success shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#28a745]" /> Upcoming Releases
                </h2>
              </div>

              <QueryPlaceholder
                isLoading={upcomingMoviesQuery.isLoading}
                isError={upcomingMoviesQuery.isError}
                error={upcomingMoviesQuery.error}
                isEmpty={!upcomingMoviesQuery.isLoading && (!upcomingMoviesQuery.data?.results || upcomingMoviesQuery.data.results.length === 0)}
                onRetry={() => upcomingMoviesQuery.refetch()}
                onReload={() => upcomingMoviesQuery.refetch()}
                loadingText="Loading upcoming releases..."
                errorTitle="Failed to load upcoming releases"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {(upcomingMoviesQuery.data?.results || []).slice(0, 10).map((item) => (
                    <MediaCard
                      key={item.id}
                      item={{ ...item, media_type: 'movie' }}
                      sessionId={sessionId}
                      accountId={account?.id}
                      onSelect={setSelectedMedia}
                      onToggleWatchlist={toggleWatchlist}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              </QueryPlaceholder>
            </section>
          </div>
        )}

        {/* My Lists Tab */}
        {activeTab === 'lists' && (
          <div className="rounded border border-border bg-card p-4 card-outline-primary">
            {isAuthenticated ? (
              <UserListsView
                lists={lists}
                watchlistMovies={watchlistMovies}
                watchlistTV={watchlistTV}
                favoriteMovies={favoriteMovies}
                favoriteTV={favoriteTV}
                sessionId={sessionId}
                accountId={account?.id}
                activeSubTab={listsSubTab}
                onSubTabChange={setListsSubTab}
                onOpenCreateModal={() => setIsCreateListModalOpen(true)}
                onDeleteList={deleteList}
                onSelectMedia={setSelectedMedia}
                onToggleWatchlist={toggleWatchlist}
                onToggleFavorite={toggleFavorite}
              />
            ) : (
              <TMDBLoginCard onLogin={login} isLoading={isLoadingAuth} error={authError} />
            )}
          </div>
        )}

        {/* Catalog & Search Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-4 rounded border border-border bg-card p-4 card-outline-primary">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div className="space-y-1">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                  {filters.searchQuery ? `Search Results for "${filters.searchQuery}"` : 'Catalog Explorer'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {filters.mediaType === 'movie' ? 'Movies' : filters.mediaType === 'tv' ? 'TV Series' : 'All Formats'}
                  {` • Total Items: ${discoverItems.length}`}
                </p>

                {/* Active Filter Badges with text color */}
                {isFiltered && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-muted-foreground font-medium">Active:</span>
                    {filters.mediaType !== 'all' && (
                      <Badge variant="outline" className="text-[10px] text-foreground border-border bg-muted">
                        {filters.mediaType === 'movie' ? 'Movies' : 'TV Series'}
                      </Badge>
                    )}
                    {filters.genreId && (
                      <Badge variant="outline" className="text-[10px] text-foreground border-border bg-muted">
                        Genre Selected
                      </Badge>
                    )}
                    {filters.personName && (
                      <Badge variant="outline" className="text-[10px] text-foreground border-border bg-muted">
                        With: {filters.personName}
                      </Badge>
                    )}
                    {filters.certification && (
                      <Badge variant="outline" className="text-[10px] text-foreground border-border bg-muted">
                        Rating: {filters.certification}
                      </Badge>
                    )}
                    {filters.originalLanguage && (
                      <Badge variant="outline" className="text-[10px] text-foreground border-border bg-muted">
                        Lang: {filters.originalLanguage.toUpperCase()}
                      </Badge>
                    )}
                    {filters.quickFilter !== 'all' && (
                      <Badge variant="outline" className="text-[10px] text-foreground border-border bg-muted capitalize">
                        {filters.quickFilter}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-muted rounded border border-border p-0.5">
                  <button
                    type="button"
                    title="Poster Grid View"
                    onClick={() => setCatalogViewMode('grid')}
                    className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                      catalogViewMode === 'grid'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Table / List View"
                    onClick={() => setCatalogViewMode('table')}
                    className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                      catalogViewMode === 'table'
                        ? 'bg-card text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isFiltered && (
                  <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs h-7 px-2.5 cursor-pointer text-muted-foreground hover:text-foreground border-border hover:bg-muted">
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Catalog Grid / Table with QueryPlaceholder */}
            <QueryPlaceholder
              isLoading={isLoadingDiscover}
              isError={isErrorDiscover}
              error={errorDiscover}
              isEmpty={!isLoadingDiscover && discoverItems.length === 0}
              onRetry={() => refetchDiscover()}
              onReload={() => refetchDiscover()}
              loadingText="Fetching catalog titles..."
              errorTitle="Failed to load catalog results"
              emptyTitle="No matching titles found"
              emptyDescription="Try adjusting your filter settings or search keywords."
            >
              {catalogViewMode === 'table' ? (
                <div className="space-y-2">
                  {discoverItems.map((item) => (
                    <MediaCard
                      key={`${item.media_type || filters.mediaType}-${item.id}`}
                      item={item}
                      sessionId={sessionId}
                      accountId={account?.id}
                      onSelect={setSelectedMedia}
                      onToggleWatchlist={toggleWatchlist}
                      onToggleFavorite={toggleFavorite}
                      variant="row"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {discoverItems.map((item) => (
                    <MediaCard
                      key={`${item.media_type || filters.mediaType}-${item.id}`}
                      item={item}
                      sessionId={sessionId}
                      accountId={account?.id}
                      onSelect={setSelectedMedia}
                      onToggleWatchlist={toggleWatchlist}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasNextPage && (
                <div className="flex justify-center pt-3 border-t border-border mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full sm:w-60 text-xs font-semibold cursor-pointer h-8"
                  >
                    {isFetchingNextPage ? 'Loading more titles...' : 'Load More Titles'}
                  </Button>
                </div>
              )}
            </QueryPlaceholder>
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
        onSelectMedia={setSelectedMedia}
        onOpenCreateListModal={() => setIsCreateListModalOpen(true)}
      />
    </div>
  );
}
