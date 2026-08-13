import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService, TMDBList, TMDBMediaItem, getTMDBImageUrl } from '@/lib/tmdb';
import { MediaCard } from '@/modules/media/components/MediaCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ListOrdered, Bookmark, Heart, Eye, FolderPlus, ArrowLeft, Trash2, Sparkles, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface UserListsViewProps {
  lists: TMDBList[];
  watchlistMovies: TMDBMediaItem[];
  watchlistTV: TMDBMediaItem[];
  favoriteMovies: TMDBMediaItem[];
  favoriteTV: TMDBMediaItem[];
  seenMovies: TMDBMediaItem[];
  seenTV: TMDBMediaItem[];
  sessionId?: string | null;
  accountId?: number | null;
  onOpenCreateModal: () => void;
  onDeleteList: (listId: number) => Promise<any>;
  onSelectMedia: (item: TMDBMediaItem) => void;
  onToggleWatchlist: (params: { mediaType: 'movie' | 'tv'; mediaId: number; watchlist: boolean }) => Promise<any>;
  onToggleFavorite: (params: { mediaType: 'movie' | 'tv'; mediaId: number; favorite: boolean }) => Promise<any>;
  onToggleSeen: (params: { mediaType: 'movie' | 'tv'; mediaId: number; isSeen: boolean }) => Promise<any>;
}

export const UserListsView: React.FC<UserListsViewProps> = ({
  lists,
  watchlistMovies,
  watchlistTV,
  favoriteMovies,
  favoriteTV,
  seenMovies,
  seenTV,
  sessionId,
  accountId,
  onOpenCreateModal,
  onDeleteList,
  onSelectMedia,
  onToggleWatchlist,
  onToggleFavorite,
  onToggleSeen,
}) => {
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('custom');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Server-paginated query for selected custom list using TMDB v4 GET /4/list/{list_id}?page={page} API
  const { data: v4ListDetail, isLoading: isLoadingV4ListDetail } = useQuery({
    queryKey: ['v4-list-detail-paginated', selectedListId, currentPage],
    queryFn: () => tmdbService.getListDetailPaginated(selectedListId!, currentPage),
    enabled: !!selectedListId && activeTab === 'custom',
  });

  // Server-paginated query for Watchlist items
  const { data: pagedWatchlistMovies, isLoading: isLoadingWatchlist } = useQuery({
    queryKey: ['paged-watchlist-movies', accountId, sessionId, currentPage],
    queryFn: () => tmdbService.getWatchlist(accountId!, sessionId!, 'movies', currentPage),
    enabled: !!accountId && !!sessionId && activeTab === 'watchlist',
  });

  const { data: pagedWatchlistTV } = useQuery({
    queryKey: ['paged-watchlist-tv', accountId, sessionId, currentPage],
    queryFn: () => tmdbService.getWatchlist(accountId!, sessionId!, 'tv', currentPage),
    enabled: !!accountId && !!sessionId && activeTab === 'watchlist',
  });

  // Server-paginated query for Favorite items
  const { data: pagedFavoriteMovies, isLoading: isLoadingFavorites } = useQuery({
    queryKey: ['paged-favorite-movies', accountId, sessionId, currentPage],
    queryFn: () => tmdbService.getFavorites(accountId!, sessionId!, 'movies', currentPage),
    enabled: !!accountId && !!sessionId && activeTab === 'favorites',
  });

  const { data: pagedFavoriteTV } = useQuery({
    queryKey: ['paged-favorite-tv', accountId, sessionId, currentPage],
    queryFn: () => tmdbService.getFavorites(accountId!, sessionId!, 'tv', currentPage),
    enabled: !!accountId && !!sessionId && activeTab === 'favorites',
  });

  // Server-paginated query for Seen/Rated items
  const { data: pagedSeenMovies, isLoading: isLoadingSeen } = useQuery({
    queryKey: ['paged-seen-movies', accountId, sessionId, currentPage],
    queryFn: () => tmdbService.getRated(accountId!, sessionId!, 'movies', currentPage),
    enabled: !!accountId && !!sessionId && activeTab === 'seen',
  });

  const { data: pagedSeenTV } = useQuery({
    queryKey: ['paged-seen-tv', accountId, sessionId, currentPage],
    queryFn: () => tmdbService.getRated(accountId!, sessionId!, 'tv', currentPage),
    enabled: !!accountId && !!sessionId && activeTab === 'seen',
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
      <div className="flex items-center justify-center gap-3 pt-6 pb-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="h-8 text-xs cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <span className="text-xs font-semibold text-muted-foreground px-2">
          Page <strong className="text-foreground">{page}</strong> of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          className="h-8 text-xs cursor-pointer"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
          <TabsList className="w-full sm:w-auto bg-card border border-border overflow-x-auto flex-nowrap justify-start p-1 h-auto scrollbar-none">
            <TabsTrigger value="custom" className="gap-1.5 text-xs py-1.5 px-3 shrink-0 cursor-pointer">
              <ListOrdered className="h-3.5 w-3.5" /> Custom Lists ({lists.length})
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="gap-1.5 text-xs py-1.5 px-3 shrink-0 cursor-pointer">
              <Bookmark className="h-3.5 w-3.5" /> Watchlist
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-1.5 text-xs py-1.5 px-3 shrink-0 cursor-pointer">
              <Heart className="h-3.5 w-3.5" /> Favorites
            </TabsTrigger>
            <TabsTrigger value="seen" className="gap-1.5 text-xs py-1.5 px-3 shrink-0 cursor-pointer">
              <Eye className="h-3.5 w-3.5" /> Watched
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'custom' && !selectedListId && (
          <Button variant="default" size="sm" onClick={onOpenCreateModal} className="w-full sm:w-auto text-xs h-9 cursor-pointer">
            <Plus className="h-4 w-4" /> Create New List
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
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedListId(null); setCurrentPage(1); }} className="h-8 text-xs cursor-pointer">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
                  </Button>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-foreground">{v4ListDetail?.name || selectedList?.name}</h2>
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
                  className="h-8 text-xs cursor-pointer shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete List
                </Button>
              </div>

              {isLoadingV4ListDetail ? (
                <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading page {currentPage} from TMDB v4 API...
                </div>
              ) : v4ListDetail?.items && v4ListDetail.items.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                    {v4ListDetail.items.map((item) => (
                      <MediaCard
                        key={item.id}
                        item={item}
                        sessionId={sessionId}
                        accountId={accountId}
                        onSelect={onSelectMedia}
                        onToggleWatchlist={onToggleWatchlist}
                        onToggleFavorite={onToggleFavorite}
                        onToggleSeen={onToggleSeen}
                      />
                    ))}
                  </div>
                  {renderPagination(v4ListDetail.page, v4ListDetail.total_pages)}
                </>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-2">
                  <Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
                  <h3 className="text-base font-bold text-foreground">This list is empty</h3>
                  <p className="text-xs text-muted-foreground">Add movies and TV series to this collection when browsing titles.</p>
                </div>
              )}
            </div>
          ) : (
            /* Custom Lists Overview */
            <div className="space-y-4">
              {lists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {lists.map((l) => {
                    const posterUrl = l.poster_path ? getTMDBImageUrl(l.poster_path, 'w500') : null;
                    return (
                      <Card
                        key={l.id}
                        onClick={() => { setSelectedListId(l.id); setCurrentPage(1); }}
                        className="group overflow-hidden hover:border-primary/50 hover:shadow-md cursor-pointer transition-all flex flex-col"
                      >
                        {posterUrl ? (
                          <div className="relative h-32 w-full overflow-hidden bg-muted">
                            <img
                              src={posterUrl}
                              alt={l.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                            <div className="absolute bottom-2 right-2">
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-background/80 text-foreground border border-border backdrop-blur-md">
                                {l.item_count} items
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                              <ListOrdered className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-semibold text-primary">{l.item_count} items</span>
                          </div>
                        )}

                        <div className="p-4 space-y-1 flex-1">
                          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {l.name}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {l.description || 'No description provided.'}
                          </p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card p-8 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto shadow-md">
                    <FolderPlus className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="text-base sm:text-lg font-bold text-foreground">No Custom Lists Created Yet</h3>
                    <p className="text-xs text-muted-foreground">
                      Create your first custom list to organize your binge collections!
                    </p>
                  </div>
                  <Button variant="default" size="sm" onClick={onOpenCreateModal} className="cursor-pointer text-xs h-9 px-4">
                    <Plus className="h-4 w-4" /> Create Your First List
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
          <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
            <Bookmark className="h-4 w-4 text-primary" /> My Watchlist
          </h2>
          {isLoadingWatchlist ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading page {currentPage}...
            </div>
          ) : (() => {
            const currentItems = [...(pagedWatchlistMovies?.results || []), ...(pagedWatchlistTV?.results || [])];
            const maxPages = Math.max(pagedWatchlistMovies?.total_pages || 1, pagedWatchlistTV?.total_pages || 1);
            return currentItems.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                  {currentItems.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      sessionId={sessionId}
                      accountId={accountId}
                      onSelect={onSelectMedia}
                      onToggleWatchlist={onToggleWatchlist}
                      onToggleFavorite={onToggleFavorite}
                      onToggleSeen={onToggleSeen}
                    />
                  ))}
                </div>
                {renderPagination(currentPage, maxPages)}
              </>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">Your watchlist is currently empty.</div>
            );
          })()}
        </div>
      )}

      {/* Tab Content: Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-primary" /> My Favorites
          </h2>
          {isLoadingFavorites ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading page {currentPage}...
            </div>
          ) : (() => {
            const currentItems = [...(pagedFavoriteMovies?.results || []), ...(pagedFavoriteTV?.results || [])];
            const maxPages = Math.max(pagedFavoriteMovies?.total_pages || 1, pagedFavoriteTV?.total_pages || 1);
            return currentItems.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                  {currentItems.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      sessionId={sessionId}
                      accountId={accountId}
                      onSelect={onSelectMedia}
                      onToggleWatchlist={onToggleWatchlist}
                      onToggleFavorite={onToggleFavorite}
                      onToggleSeen={onToggleSeen}
                    />
                  ))}
                </div>
                {renderPagination(currentPage, maxPages)}
              </>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">No favorite titles saved yet.</div>
            );
          })()}
        </div>
      )}

      {/* Tab Content: Seen / Watched */}
      {activeTab === 'seen' && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-primary" /> Watched / Seen Titles
          </h2>
          {isLoadingSeen ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading page {currentPage}...
            </div>
          ) : (() => {
            const currentItems = [...(pagedSeenMovies?.results || []), ...(pagedSeenTV?.results || [])];
            const maxPages = Math.max(pagedSeenMovies?.total_pages || 1, pagedSeenTV?.total_pages || 1);
            return currentItems.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
                  {currentItems.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      sessionId={sessionId}
                      accountId={accountId}
                      onSelect={onSelectMedia}
                      onToggleWatchlist={onToggleWatchlist}
                      onToggleFavorite={onToggleFavorite}
                      onToggleSeen={onToggleSeen}
                    />
                  ))}
                </div>
                {renderPagination(currentPage, maxPages)}
              </>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">No titles marked as seen yet.</div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
