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
    <div className="relative w-full h-[320px] sm:h-[400px] rounded-2xl overflow-hidden border border-border shadow-md group">
      {/* Backdrop Image */}
      <img
        key={currentItem.id}
        src={backdropUrl}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
      />

      {/* Adaptive Theme Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent w-full sm:w-3/4" />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col justify-end h-full p-5 sm:p-8 max-w-2xl space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-[10px] px-2.5 py-0.5 uppercase tracking-wider font-semibold">
            <Sparkles className="h-3 w-3 mr-1 inline" /> Featured
          </Badge>
          <Badge variant="outline" className="text-[10px] bg-background/60 backdrop-blur-md">
            {mediaType === 'movie' ? <Film className="h-3 w-3 mr-1 inline" /> : <Tv className="h-3 w-3 mr-1 inline" />}
            {mediaType === 'movie' ? 'Movie' : 'TV Series'}
          </Badge>
        </div>

        <h1 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight line-clamp-1">
          {title}
        </h1>

        {currentItem.vote_average > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center text-amber-500 font-bold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-1" />
              {currentItem.vote_average.toFixed(1)} / 10
            </span>
            <span>•</span>
            <span>{currentItem.release_date || currentItem.first_air_date}</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {currentItem.overview}
        </p>

        <div className="pt-1">
          <Button variant="default" size="sm" onClick={() => onSelect(currentItem)} className="cursor-pointer text-xs h-8 px-4">
            <Info className="h-4 w-4" /> View Details
          </Button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-3 right-3 z-10 flex gap-1">
        {featuredList.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === currentIndex ? 'w-5 bg-primary' : 'w-1.5 bg-foreground/30 hover:bg-foreground/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
