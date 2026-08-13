import React from 'react';
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
  onToggleSeen: (params: { mediaType: 'movie' | 'tv'; mediaId: number; isSeen: boolean }) => Promise<any>;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  sessionId,
  accountId,
  onSelect,
  onToggleWatchlist,
  onToggleFavorite,
  onToggleSeen,
}) => {
  const mediaType: 'movie' | 'tv' = item.media_type === 'tv' || item.name ? 'tv' : 'movie';
  const title = item.title || item.name || 'Untitled';
  const dateString = item.release_date || item.first_air_date;
  const year = dateString ? new Date(dateString).getFullYear() : null;
  const posterUrl = getTMDBImageUrl(item.poster_path, 'w500');

  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md cursor-pointer"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Subtle Bottom Poster Gradient for Quick Actions */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

        {/* Media Format Badge */}
        <div className="absolute top-1.5 left-1.5 z-10">
          <Badge variant="glass" className="font-semibold text-[9px] px-1.5 py-0.2 uppercase tracking-wider bg-background/80 text-foreground border-border/50">
            {mediaType === 'movie' ? <Film className="h-2.5 w-2.5 text-primary mr-1 inline" /> : <Tv className="h-2.5 w-2.5 text-primary mr-1 inline" />}
            {mediaType}
          </Badge>
        </div>

        {/* Rating Badge */}
        {item.vote_average > 0 && (
          <div className="absolute top-1.5 right-1.5 z-10">
            <Badge variant="gold" className="flex items-center gap-0.5 font-bold text-[10px] px-1.5 py-0.2">
              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              {item.vote_average.toFixed(1)}
            </Badge>
          </div>
        )}

        {/* Quick Action Buttons Overlay */}
        <div className="absolute bottom-1.5 right-1.5 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
          <QuickMediaActions
            mediaType={mediaType}
            mediaId={item.id}
            mediaTitle={title}
            sessionId={sessionId}
            accountId={accountId}
            onToggleWatchlist={onToggleWatchlist}
            onToggleFavorite={onToggleFavorite}
            onToggleSeen={onToggleSeen}
          />
        </div>
      </div>

      {/* Card Metadata */}
      <div className="flex flex-1 flex-col justify-between p-2.5">
        <div>
          <h4 className="line-clamp-1 text-xs font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h4>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {year ? year : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};
