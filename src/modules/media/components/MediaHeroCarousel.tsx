import React, { useState, useEffect } from 'react';
import { TMDBMediaItem, getTMDBBackdropUrl } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Info, Film, Tv, Sparkles } from 'lucide-react';

interface MediaHeroCarouselProps {
  items: TMDBMediaItem[];
  onSelect: (item: TMDBMediaItem) => void;
}

export const MediaHeroCarousel: React.FC<MediaHeroCarouselProps> = ({ items, onSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const featuredList = items.filter((item) => item.backdrop_path).slice(0, 5);

  useEffect(() => {
    if (featuredList.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredList.length]);

  if (featuredList.length === 0) return null;

  const currentItem = featuredList[currentIndex];
  const mediaType = currentItem.media_type === 'tv' || currentItem.name ? 'tv' : 'movie';
  const title = currentItem.title || currentItem.name || 'Featured Title';
  const backdropUrl = getTMDBBackdropUrl(currentItem.backdrop_path, 'original');

  return (
    <div className="relative w-full h-[280px] sm:h-[340px] rounded overflow-hidden border border-border bg-card shadow-xs group card-outline-primary">
      {/* Backdrop Image */}
      <img
        key={currentItem.id}
        src={backdropUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Solid Dark Tint Overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-end h-full p-4 sm:p-6 max-w-xl space-y-2 text-white">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold">
            <Sparkles className="h-3 w-3 mr-1 inline" /> Spotlight
          </Badge>
          <Badge variant="outline" className="text-[10px] text-white border-white/30 bg-black/40">
            {mediaType === 'movie' ? <Film className="h-3 w-3 mr-1 inline" /> : <Tv className="h-3 w-3 mr-1 inline" />}
            {mediaType === 'movie' ? 'Movie' : 'TV Series'}
          </Badge>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white line-clamp-1">
          {title}
        </h1>

        {currentItem.vote_average > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="flex items-center text-amber-400 font-bold">
              <Star className="h-3.5 w-3.5 fill-current mr-1" />
              {currentItem.vote_average.toFixed(1)} / 10
            </span>
            <span>•</span>
            <span>{currentItem.release_date || currentItem.first_air_date}</span>
          </div>
        )}

        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {currentItem.overview}
        </p>

        <div className="pt-1">
          <Button variant="default" size="sm" onClick={() => onSelect(currentItem)} className="cursor-pointer text-xs h-7 px-3">
            <Info className="h-3.5 w-3.5 mr-1" /> View Details
          </Button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-3 right-3 z-10 flex gap-1">
        {featuredList.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-xs transition-colors cursor-pointer ${
              idx === currentIndex ? 'w-4 bg-primary' : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
