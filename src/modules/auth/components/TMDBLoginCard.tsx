import React from 'react';
import { Button } from '@/components/ui/button';
import { Film, LogIn, Sparkles, ShieldCheck, ListOrdered, Heart, Bookmark } from 'lucide-react';

interface TMDBLoginCardProps {
  onLogin: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const TMDBLoginCard: React.FC<TMDBLoginCardProps> = ({ onLogin, isLoading, error }) => {
  return (
    <div className="relative overflow-hidden rounded border border-border bg-card p-6 sm:p-8 card-outline-primary">
      <div className="relative z-10 flex flex-col items-center text-center space-y-5 max-w-lg mx-auto">
        <div className="flex h-12 w-12 items-center justify-center rounded bg-primary text-primary-foreground">
          <Film className="h-6 w-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Connect Your TMDB Account
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sync with <span className="font-semibold text-primary">The Movie Database (TMDB)</span> to manage custom lists, save items to your watchlist, and organize your favorite titles.
          </p>
        </div>

        {error && (
          <div className="w-full rounded border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full my-2">
          <div className="flex flex-col items-center p-3 rounded bg-muted border border-border text-xs text-foreground font-medium">
            <ListOrdered className="h-4 w-4 text-primary mb-1" />
            <span>Custom Lists</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded bg-muted border border-border text-xs text-foreground font-medium">
            <Bookmark className="h-4 w-4 text-primary mb-1" />
            <span>Watchlist</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded bg-muted border border-border text-xs text-foreground font-medium">
            <Heart className="h-4 w-4 text-destructive mb-1" />
            <span>Favorites</span>
          </div>
        </div>

        <div className="flex flex-col w-full sm:w-auto gap-2.5 pt-2">
          <Button
            size="lg"
            variant="default"
            onClick={onLogin}
            disabled={isLoading}
            className="w-full sm:w-72 cursor-pointer h-9 text-xs"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 animate-spin" /> Redirecting to TMDB...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" /> Login with TMDB Account
              </span>
            )}
          </Button>
          <span className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure OAuth session via themoviedb.org
          </span>
        </div>
      </div>
    </div>
  );
};
