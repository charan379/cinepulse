import React, { useState } from 'react';
import { TMDBMediaItem, getTMDBImageUrl } from '@/lib/tmdb';
import { QuickMediaActions } from '@/modules/lists/components/QuickMediaActions';
import { Badge } from '@/components/ui/badge';
import { Star, Film, Tv } from 'lucide-react';

interface MediaCardProps {
  item: TMDBMediaItem;
  sessionId?: string | null;
  accountId?: number | null;
  onSelect: (item: TMDBMediaItem) => void;
  onToggleWatchlist: (params: { mediaType: 'movie' | 'tv'; mediaId: number; watchlist: boolean }) => Promise<any>;
  onToggleFavorite: (params: { mediaType: 'movie' | 'tv'; mediaId: number; favorite: boolean }) => Promise<any>;
  variant?: 'grid' | 'row';
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  sessionId,
  accountId,
  onSelect,
  onToggleWatchlist,
  onToggleFavorite,
  variant = 'grid',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const mediaType: 'movie' | 'tv' = item.media_type === 'tv' || item.name ? 'tv' : 'movie';
  const title = item.title || item.name || 'Untitled';
  const dateString = item.release_date || item.first_air_date;
  const year = dateString ? new Date(dateString).getFullYear() : null;
  const posterUrl = getTMDBImageUrl(item.poster_path, 'w500');

  if (variant === 'row') {
    return (
      <div
        onClick={() => onSelect(item)}
        onMouseEnter={() => setIsHovered(true)}
        className="flex items-center gap-3 p-2.5 rounded border border-border bg-card hover:bg-muted/40 transition-colors cursor-pointer group"
      >
        <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-muted border border-border">
          {posterUrl ? (
            <img src={posterUrl} alt={title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-[10px]">
              No Img
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {title}
            </h4>
            <span className="text-[11px] text-muted-foreground shrink-0">
              {year || 'N/A'}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
            {item.overview || 'No synopsis provided.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {item.vote_average > 0 && (
            <Badge variant="warning" className="text-[10px] font-bold px-1.5 py-0.5">
              <Star className="h-3 w-3 mr-0.5 fill-current" />
              {item.vote_average.toFixed(1)}
            </Badge>
          )}

          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            {mediaType === 'movie' ? 'Movie' : 'TV'}
          </Badge>

          <QuickMediaActions
            mediaType={mediaType}
            mediaId={item.id}
            mediaTitle={title}
            sessionId={sessionId}
            accountId={accountId}
            onToggleWatchlist={onToggleWatchlist}
            onToggleFavorite={onToggleFavorite}
            enabled={isHovered}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(item)}
      onMouseEnter={() => setIsHovered(true)}
      className="group relative flex flex-col overflow-hidden rounded border border-border bg-card text-card-foreground transition-all duration-150 hover:border-primary hover:shadow-sm cursor-pointer"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted border-b border-border">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-102"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No Poster Available
          </div>
        )}

        {/* Media Format Badge (Top Left) */}
        <div className="absolute top-1.5 left-1.5 z-10">
          <Badge variant="secondary" className="font-semibold text-[9px] px-1 py-0.5 uppercase tracking-wider">
            {mediaType === 'movie' ? <Film className="h-3 w-3 text-foreground" /> : <Tv className="h-3 w-3 text-foreground" />}
          </Badge>
        </div>

        {/* Rating Badge (Top Right) */}
        {item.vote_average > 0 && (
          <div className="absolute top-1.5 right-1.5 z-10">
            <Badge variant="warning" className="flex items-center gap-0.5 font-bold text-[10px] px-1.5 py-0.2">
              <Star className="h-2.5 w-2.5 fill-current" />
              {item.vote_average.toFixed(1)}
            </Badge>
          </div>
        )}

        {/* Quick Actions (Bottom Right overlay on hover) */}
        <div className="absolute bottom-1.5 right-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <QuickMediaActions
            mediaType={mediaType}
            mediaId={item.id}
            mediaTitle={title}
            sessionId={sessionId}
            accountId={accountId}
            onToggleWatchlist={onToggleWatchlist}
            onToggleFavorite={onToggleFavorite}
            enabled={isHovered}
          />
        </div>
      </div>

      {/* Card Metadata */}
      <div className="flex flex-1 flex-col justify-between p-2">
        <div>
          <h4 className="line-clamp-1 text-xs font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h4>
          <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
            <span>{year ? year : 'N/A'}</span>
            <span className="uppercase text-[10px] tracking-wider text-muted-foreground/80 font-medium">
              {mediaType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
