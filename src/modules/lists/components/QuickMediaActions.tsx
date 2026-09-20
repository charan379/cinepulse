import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService } from '@/lib/tmdb';
import { ShareMediaModal } from '@/components/ShareMediaModal';
import { Button } from '@/components/ui/button';
import { Bookmark, Heart, Share2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickMediaActionsProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  mediaTitle?: string;
  sessionId?: string | null;
  accountId?: number | null;
  onToggleWatchlist: (params: { mediaType: 'movie' | 'tv'; mediaId: number; watchlist: boolean }) => Promise<any>;
  onToggleFavorite: (params: { mediaType: 'movie' | 'tv'; mediaId: number; favorite: boolean }) => Promise<any>;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'compact' | 'full';
  enabled?: boolean; // Controls whether to load account state (only on hover or modal)
}

export const QuickMediaActions: React.FC<QuickMediaActionsProps> = ({
  mediaType,
  mediaId,
  mediaTitle,
  sessionId,
  onToggleWatchlist,
  onToggleFavorite,
  size = 'sm',
  variant = 'compact',
  enabled = false,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPendingWatchlist, setIsPendingWatchlist] = useState(false);
  const [isPendingFavorite, setIsPendingFavorite] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);

  // ONLY load account states when:
  // 1. In modal (variant === 'full'), OR
  // 2. Parent card is hovered (enabled === true), OR
  // 3. This action bar was directly hovered (hasHovered === true)
  const shouldFetch = !!sessionId && (variant === 'full' || enabled || hasHovered);

  const { data: accountState, isLoading, refetch } = useQuery({
    queryKey: ['account-states', mediaType, mediaId, sessionId],
    queryFn: () => tmdbService.getAccountStates(mediaType, mediaId, sessionId!),
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5,
  });

  const isFavorite = !!accountState?.favorite;
  const isWatchlist = !!accountState?.watchlist;

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!sessionId || isPendingWatchlist) return;
    setIsPendingWatchlist(true);
    try {
      await onToggleWatchlist({ mediaType, mediaId, watchlist: !isWatchlist });
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPendingWatchlist(false);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!sessionId || isPendingFavorite) return;
    setIsPendingFavorite(true);
    try {
      await onToggleFavorite({ mediaType, mediaId, favorite: !isFavorite });
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPendingFavorite(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  const mediaItemData = {
    id: mediaId,
    media_type: mediaType,
    title: mediaTitle,
    name: mediaTitle,
    overview: '',
    poster_path: null,
    backdrop_path: null,
    popularity: 0,
    vote_average: 0,
    vote_count: 0,
  };

  if (variant === 'full') {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          {sessionId && (
            <>
              <Button
                size={size}
                variant={isWatchlist ? 'default' : 'outline'}
                onClick={handleWatchlistClick}
                disabled={isPendingWatchlist || isLoading}
                className={cn(isWatchlist && 'bg-primary text-primary-foreground border-primary')}
              >
                {isPendingWatchlist || isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Bookmark className={cn('h-3.5 w-3.5', isWatchlist && 'fill-current')} />
                )}
                <span>{isWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
              </Button>

              <Button
                size={size}
                variant={isFavorite ? 'destructive' : 'outline'}
                onClick={handleFavoriteClick}
                disabled={isPendingFavorite || isLoading}
                className={cn(isFavorite && 'bg-destructive text-destructive-foreground border-destructive')}
              >
                {isPendingFavorite || isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Heart className={cn('h-3.5 w-3.5', isFavorite && 'fill-current')} />
                )}
                <span>{isFavorite ? 'In Favorites' : 'Favorite'}</span>
              </Button>
            </>
          )}

          <Button size={size} variant="outline" onClick={handleShareClick}>
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </Button>
        </div>

        <ShareMediaModal
          item={mediaItemData}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="flex items-center gap-1 bg-card/95 p-1 rounded border border-border shadow-xs"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setHasHovered(true)}
      >
        {sessionId && (
          <>
            <button
              type="button"
              disabled={isPendingWatchlist}
              title={isWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              onClick={handleWatchlistClick}
              className={cn(
                'p-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer',
                isWatchlist ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {isPendingWatchlist || (isLoading && shouldFetch) ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Bookmark className={cn('h-3.5 w-3.5', isWatchlist && 'fill-current')} />
              )}
            </button>

            <button
              type="button"
              disabled={isPendingFavorite}
              title={isFavorite ? 'In Favorites' : 'Mark Favorite'}
              onClick={handleFavoriteClick}
              className={cn(
                'p-1.5 rounded transition-colors disabled:opacity-50 cursor-pointer',
                isFavorite ? 'bg-destructive text-destructive-foreground font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {isPendingFavorite || (isLoading && shouldFetch) ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Heart className={cn('h-3.5 w-3.5', isFavorite && 'fill-current')} />
              )}
            </button>
          </>
        )}

        <button
          type="button"
          title="Share title"
          onClick={handleShareClick}
          className="p-1.5 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <ShareMediaModal
        item={mediaItemData}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
};
