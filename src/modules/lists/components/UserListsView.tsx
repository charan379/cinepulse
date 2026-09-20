import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService, TMDBList, TMDBMediaItem, getTMDBImageUrl } from '@/lib/tmdb';
import { MediaCard } from '@/modules/media/components/MediaCard';
import { QueryPlaceholder } from '@/components/QueryPlaceholder';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ListOrdered, Bookmark, Heart, FolderPlus, ArrowLeft, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface UserListsViewProps {
  lists: TMDBList[];
  watchlistMovies: TMDBMediaItem[];
  watchlistTV: TMDBMediaItem[];
  favoriteMovies: TMDBMediaItem[];
  favoriteTV: TMDBMediaItem[];
  sessionId?: string | null;
  accountId?: number | null;
  onOpenCreateModal: () => void;
  onDeleteList: (listId: number) => Promise<any>;
  onSelectMedia: (item: TMDBMediaItem) => void;
  onToggleWatchlist: (params: { mediaType: 'movie' | 'tv'; mediaId: number; watchlist: boolean }) => Promise<any>;
  onToggleFavorite: (params: { mediaType: 'movie' | 'tv'; mediaId: number; favorite: boolean }) => Promise<any>;
}

export const UserListsView: React.FC<UserListsViewProps> = ({
  lists,
  sessionId,
  accountId,
  onOpenCreateModal,
  onDeleteList,
  onSelectMedia,
  onToggleWatchlist,
  onToggleFavorite,
}) => {
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('custom');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Server-paginated query for selected custom list using TMDB v4 GET /4/list/{list_id}?page={page} API
  const {
    data: v4ListDetail,
    isLoading: isLoadingV4ListDetail,
    isError: isErrorV4ListDetail,
    error: errorV4ListDetail,
    refetch: refetchV4ListDetail,
  } = useQuery({
    queryKey: ['v4-list-detail-paginated', selectedListId, currentPage],
    queryFn: () => tmdbService.getListDetailPaginated(selectedListId!, currentPage),
    enabled: !!selectedListId && activeTab === 'custom',
  });

  // Server-paginated query for Watchlist items
  const {
    data: pagedWatchlistMovies,
    isLoading: isLoadingWatchlistMovies,
    isError: isErrorWatchlistMovies,
    error: errorWatchlistMovies,
    refetch: refetchWatchlistMovies,
  } = useQuery({
    queryKey: ['paged-watchlist-movies', accountId, sessionId, currentPage],
    queryFn: () => tmdbService.getWatchlist(accountId!, sessionId!, 'movies', currentPage),
    enabled: !!accountId && !!sessionId && activeTab === 'watchlist',
  });

  const {
    data: pagedWatchlistTV,
    isLoading: isLoadingWatchlistTV,
    isError: isErrorWatchlistTV,
    refetch: refetchWatchlistTV,
  } = useQuery({
    queryKey: ['paged-watchlist-tv', accountId, sessionId, currentPage],
    queryFn: () => tmdbService.getWatchlist(accountId!, sessionId!, 'tv', currentPage),
    enabled: !!accountId && !!sessionId && activeTab === 'watchlist',
  });

  // Server-paginated query for Favorite items
  const {
    data: pagedFavoriteMovies,
    isLoading: isLoadingFavoritesMovies,
    isError: isErrorFavoritesMovies,
    error: errorFavoritesMovies,
    refetch: refetchFavoritesMovies,
  } = useQuery({
    queryKey: ['paged-favorite-movies', accountId, sessionId, currentPage],
    queryFn: () => tmdbService.getFavorites(accountId!, sessionId!, 'movies', currentPage),
    enabled: !!accountId && !!sessionId && activeTab === 'favorites',
  });

  const {
    data: pagedFavoriteTV,
    isLoading: isLoadingFavoritesTV,
    isError: isErrorFavoritesTV,
    refetch: refetchFavoritesTV,
  } = useQuery({
    queryKey: ['paged-favorite-tv', accountId, sessionId, currentPage],
    queryFn: () => tmdbService.getFavorites(accountId!, sessionId!, 'tv', currentPage),
    enabled: !!accountId && !!sessionId && activeTab === 'favorites',
  });

  const selectedList = lists.find((l) => l.id === selectedListId);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSelectedListId(null);
    setCurrentPage(1);
  };

  const renderPagination = (page: number, totalPages: number) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 pt-4 pb-2 border-t border-border mt-4">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="h-7 text-xs cursor-pointer"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
        </Button>
        <span className="text-xs font-semibold text-muted-foreground px-2">
          Page <strong className="text-foreground">{page}</strong> of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className="h-7 text-xs cursor-pointer"
        >
          Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-border pb-3">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto overflow-x-auto flex-nowrap justify-start h-8">
            <TabsTrigger value="custom" className="gap-1.5 text-xs py-1 px-3 shrink-0 cursor-pointer">
              <ListOrdered className="h-3.5 w-3.5" /> Custom Lists ({lists.length})
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="gap-1.5 text-xs py-1 px-3 shrink-0 cursor-pointer">
              <Bookmark className="h-3.5 w-3.5" /> Watchlist
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-1.5 text-xs py-1 px-3 shrink-0 cursor-pointer">
              <Heart className="h-3.5 w-3.5" /> Favorites
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'custom' && !selectedListId && (
          <Button variant="default" size="sm" onClick={onOpenCreateModal} className="w-full sm:w-auto text-xs h-8 cursor-pointer">
            <Plus className="h-3.5 w-3.5 mr-1" /> Create New List
          </Button>
        )}
      </div>

      {/* Tab Content: Custom Lists */}
      {activeTab === 'custom' && (
        <>
          {selectedListId ? (
            /* Selected Custom List View */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedListId(null); setCurrentPage(1); }} className="h-7 text-xs cursor-pointer">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
                  </Button>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-foreground">{v4ListDetail?.name || selectedList?.name}</h2>
                    {(v4ListDetail?.description || selectedList?.description) && (
                      <p className="text-xs text-muted-foreground">{v4ListDetail?.description || selectedList?.description}</p>
                    )}
                  </div>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    if (confirm('Are you sure you want to delete this list?')) {
                      await onDeleteList(selectedListId);
                      setSelectedListId(null);
                    }
                  }}
                  className="h-7 text-xs cursor-pointer shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete List
                </Button>
              </div>

              <QueryPlaceholder
                isLoading={isLoadingV4ListDetail}
                isError={isErrorV4ListDetail}
                error={errorV4ListDetail}
                isEmpty={!isLoadingV4ListDetail && (!v4ListDetail?.items || v4ListDetail.items.length === 0)}
                onRetry={() => refetchV4ListDetail()}
                onReload={() => refetchV4ListDetail()}
                loadingText={`Loading list items (Page ${currentPage})...`}
                errorTitle="Failed to load list details"
                emptyTitle="This collection is empty"
                emptyDescription="Add titles to this list when browsing movies and TV series."
              >
                {v4ListDetail?.items && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                      {v4ListDetail.items.map((item) => (
                        <MediaCard
                          key={item.id}
                          item={item}
                          sessionId={sessionId}
                          accountId={accountId}
                          onSelect={onSelectMedia}
                          onToggleWatchlist={onToggleWatchlist}
                          onToggleFavorite={onToggleFavorite}
                        />
                      ))}
                    </div>
                    {renderPagination(v4ListDetail.page, v4ListDetail.total_pages)}
                  </>
                )}
              </QueryPlaceholder>
            </div>
          ) : (
            /* Custom Lists Overview */
            <div className="space-y-4">
              {lists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {lists.map((l) => {
                    const posterUrl = l.poster_path ? getTMDBImageUrl(l.poster_path, 'w500') : null;
                    return (
                      <Card
                        key={l.id}
                        onClick={() => { setSelectedListId(l.id); setCurrentPage(1); }}
                        className="group overflow-hidden border border-border hover:border-primary cursor-pointer transition-colors flex flex-col card-outline-primary"
                      >
                        {posterUrl ? (
                          <div className="relative h-28 w-full overflow-hidden bg-muted border-b border-border">
                            <img
                              src={posterUrl}
                              alt={l.name}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute bottom-2 right-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-card text-foreground border border-border">
                                {l.item_count} items
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 border-b border-border flex items-center justify-between bg-muted/20">
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary border border-primary/20">
                              <ListOrdered className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-primary">{l.item_count} items</span>
                          </div>
                        )}

                        <div className="p-3 space-y-1 flex-1">
                          <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {l.name}
                          </h3>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {l.description || 'No description provided.'}
                          </p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded border border-dashed border-border bg-card p-8 text-center space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-primary text-primary-foreground mx-auto">
                    <FolderPlus className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="text-sm font-bold text-foreground">No Custom Lists Created Yet</h3>
                    <p className="text-xs text-muted-foreground">
                      Create your first custom list to organize your collections!
                    </p>
                  </div>
                  <Button variant="default" size="sm" onClick={onOpenCreateModal} className="cursor-pointer text-xs h-8 px-3">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Create Your First List
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Tab Content: Watchlist */}
      {activeTab === 'watchlist' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Bookmark className="h-4 w-4 text-primary" /> My Watchlist
            </h2>
          </div>

          {(() => {
            const isLoading = isLoadingWatchlistMovies || isLoadingWatchlistTV;
            const isError = isErrorWatchlistMovies || isErrorWatchlistTV;
            const currentItems = [...(pagedWatchlistMovies?.results || []), ...(pagedWatchlistTV?.results || [])];
            const maxPages = Math.max(pagedWatchlistMovies?.total_pages || 1, pagedWatchlistTV?.total_pages || 1);

            return (
              <QueryPlaceholder
                isLoading={isLoading}
                isError={isError}
                error={errorWatchlistMovies}
                isEmpty={!isLoading && currentItems.length === 0}
                onRetry={() => {
                  refetchWatchlistMovies();
                  refetchWatchlistTV();
                }}
                onReload={() => {
                  refetchWatchlistMovies();
                  refetchWatchlistTV();
                }}
                loadingText={`Loading Watchlist (Page ${currentPage})...`}
                errorTitle="Failed to load Watchlist titles"
                emptyTitle="Your Watchlist is empty"
                emptyDescription="Save movies and TV shows to your watchlist while exploring titles."
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {currentItems.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      sessionId={sessionId}
                      accountId={accountId}
                      onSelect={onSelectMedia}
                      onToggleWatchlist={onToggleWatchlist}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))}
                </div>
                {renderPagination(currentPage, maxPages)}
              </QueryPlaceholder>
            );
          })()}
        </div>
      )}

      {/* Tab Content: Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Heart className="h-4 w-4 text-destructive" /> My Favorites
            </h2>
          </div>

          {(() => {
            const isLoading = isLoadingFavoritesMovies || isLoadingFavoritesTV;
            const isError = isErrorFavoritesMovies || isErrorFavoritesTV;
            const currentItems = [...(pagedFavoriteMovies?.results || []), ...(pagedFavoriteTV?.results || [])];
            const maxPages = Math.max(pagedFavoriteMovies?.total_pages || 1, pagedFavoriteTV?.total_pages || 1);

            return (
              <QueryPlaceholder
                isLoading={isLoading}
                isError={isError}
                error={errorFavoritesMovies}
                isEmpty={!isLoading && currentItems.length === 0}
                onRetry={() => {
                  refetchFavoritesMovies();
                  refetchFavoritesTV();
                }}
                onReload={() => {
                  refetchFavoritesMovies();
                  refetchFavoritesTV();
                }}
                loadingText={`Loading Favorites (Page ${currentPage})...`}
                errorTitle="Failed to load Favorite titles"
                emptyTitle="No favorites saved yet"
                emptyDescription="Mark your favorite movies and shows to access them quickly."
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {currentItems.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      sessionId={sessionId}
                      accountId={accountId}
                      onSelect={onSelectMedia}
                      onToggleWatchlist={onToggleWatchlist}
                      onToggleFavorite={onToggleFavorite}
                    />
                  ))}
                </div>
                {renderPagination(currentPage, maxPages)}
              </QueryPlaceholder>
            );
          })()}
        </div>
      )}
    </div>
  );
};
