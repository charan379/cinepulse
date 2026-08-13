import React from 'react';
import { Button } from '@/components/ui/button';
import { Film, LogIn, Sparkles, ShieldCheck, ListOrdered, Heart, Eye } from 'lucide-react';

interface TMDBLoginCardProps {
  onLogin: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const TMDBLoginCard: React.FC<TMDBLoginCardProps> = ({ onLogin, isLoading, error }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl backdrop-blur-2xl">
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-xl mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
          <Film className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Welcome to CinePulse
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Connect your <span className="font-semibold text-primary">The Movie Database (TMDB)</span> account to manage your personal movie and TV lists, watchlist, favorites, and track what you've seen.
          </p>
        </div>

        {error && (
          <div className="w-full rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full my-4">
          <div className="flex flex-col items-center p-3 rounded-2xl bg-muted border border-border text-xs text-foreground font-medium">
            <ListOrdered className="h-5 w-5 text-primary mb-1" />
            <span>Custom Lists</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-2xl bg-muted border border-border text-xs text-foreground font-medium">
            <Heart className="h-5 w-5 text-primary mb-1" />
            <span>Watchlist & Favs</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-2xl bg-muted border border-border text-xs text-foreground font-medium">
            <Eye className="h-5 w-5 text-primary mb-1" />
            <span>Watched ("Seen")</span>
          </div>
        </div>

        <div className="flex flex-col w-full sm:w-auto gap-3">
          <Button
            size="lg"
            variant="default"
            onClick={onLogin}
            disabled={isLoading}
            className="w-full sm:w-80 shadow-lg cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin" /> Redirecting to TMDB...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 text-base">
                <LogIn className="h-5 w-5" /> Login with TMDB Account
              </span>
            )}
          </Button>
          <span className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure OAuth session directly via themoviedb.org
          </span>
        </div>
      </div>
    </div>
  );
};
