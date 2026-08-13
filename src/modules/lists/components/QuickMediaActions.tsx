import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService } from '@/lib/tmdb';
import { ShareMediaModal } from '@/components/ShareMediaModal';
import { Button } from '@/components/ui/button';
import { Eye, Bookmark, Heart, Share2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickMediaActionsProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  mediaTitle?: string;
  sessionId?: string | null;
  accountId?: number | null;
  onToggleWatchlist: (params: { mediaType: 'movie' | 'tv'; mediaId: number; watchlist: boolean }) => Promise<any>;
  onToggleFavorite: (params: { mediaType: 'movie' | 'tv'; mediaId: number; favorite: boolean }) => Promise<any>;
  onToggleSeen: (params: { mediaType: 'movie' | 'tv'; mediaId: number; isSeen: boolean }) => Promise<any>;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'compact' | 'full';
}

export const QuickMediaActions: React.FC<QuickMediaActionsProps> = ({
  mediaType,
  mediaId,
  mediaTitle,
  sessionId,
  onToggleWatchlist,
  onToggleFavorite,
  onToggleSeen,
  size = 'sm',
  variant = 'compact',
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPendingWatchlist, setIsPendingWatchlist] = useState(false);
  const [isPendingFavorite, setIsPendingFavorite] = useState(false);
  const [isPendingSeen, setIsPendingSeen] = useState(false);

  // Account state query (is this movie in user's watchlist, favorite, or rated/seen)
  const { data: accountState, isLoading, refetch } = useQuery({
    queryKey: ['account-states', mediaType, mediaId, sessionId],
    queryFn: () => tmdbService.getAccountStates(mediaType, mediaId, sessionId!),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 2,
  });

  const isFavorite = !!accountState?.favorite;
  const isWatchlist = !!accountState?.watchlist;
  const isSeen = !!accountState?.rated;

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

  const handleSeenClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!sessionId || isPendingSeen) return;
    setIsPendingSeen(true);
    try {
      await onToggleSeen({ mediaType, mediaId, isSeen: !isSeen });
      await refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPendingSeen(false);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-1 opacity-50">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                variant={isSeen ? 'glow' : 'outline'}
                onClick={handleSeenClick}
                disabled={isPendingSeen}
                className={cn(isSeen && 'from-cyan-600 to-blue-600 shadow-cyan-500/25')}
              >
                {isPendingSeen ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className={cn('h-4 w-4', isSeen && 'fill-current')} />
                )}
                <span>{isSeen ? 'Watched' : 'Mark Watched'}</span>
              </Button>

              <Button
                size={size}
                variant={isWatchlist ? 'default' : 'outline'}
                onClick={handleWatchlistClick}
                disabled={isPendingWatchlist}
                className={cn(isWatchlist && 'bg-indigo-600 hover:bg-indigo-500 text-white')}
              >
                {isPendingWatchlist ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bookmark className={cn('h-4 w-4', isWatchlist && 'fill-current')} />
                )}
                <span>{isWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
              </Button>

              <Button
                size={size}
                variant={isFavorite ? 'destructive' : 'outline'}
                onClick={handleFavoriteClick}
                disabled={isPendingFavorite}
                className={cn(isFavorite && 'bg-pink-600 hover:bg-pink-500 text-white border-pink-500/40')}
              >
                {isPendingFavorite ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
                )}
                <span>{isFavorite ? 'Favorite' : 'Favorite'}</span>
              </Button>
            </>
          )}

          <Button size={size} variant="outline" onClick={handleShareClick}>
            <Share2 className="h-4 w-4" />
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
        className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {sessionId && (
          <>
            <button
              type="button"
              disabled={isPendingSeen}
              title={isSeen ? 'Watched' : 'Mark as Seen'}
              onClick={handleSeenClick}
              className={cn(
                'p-1.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer',
                isSeen ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-white/15'
              )}
            >
              {isPendingSeen ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>

            <button
              type="button"
              disabled={isPendingWatchlist}
              title={isWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              onClick={handleWatchlistClick}
              className={cn(
                'p-1.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer',
                isWatchlist ? 'bg-indigo-500 text-white font-bold' : 'text-slate-300 hover:bg-white/15'
              )}
            >
              {isPendingWatchlist ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )}
            </button>

            <button
              type="button"
              disabled={isPendingFavorite}
              title={isFavorite ? 'Favorite' : 'Mark Favorite'}
              onClick={handleFavoriteClick}
              className={cn(
                'p-1.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer',
                isFavorite ? 'bg-pink-500 text-white font-bold' : 'text-slate-300 hover:bg-white/15'
              )}
            >
              {isPendingFavorite ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Heart className="h-3.5 w-3.5" />
              )}
            </button>
          </>
        )}

        <button
          type="button"
          title="Share title"
          onClick={handleShareClick}
          className="p-1.5 rounded-full text-slate-300 hover:bg-white/15 transition-colors cursor-pointer"
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
