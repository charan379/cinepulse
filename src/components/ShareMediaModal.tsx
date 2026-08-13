import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TMDBMediaItem } from '@/lib/tmdb';
import { Share2, Copy, Check, ExternalLink, Globe, Sparkles } from 'lucide-react';

interface ShareMediaModalProps {
  item: TMDBMediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  watchProviderLink?: string | null;
}

export const ShareMediaModal: React.FC<ShareMediaModalProps> = ({ item, isOpen, onClose, watchProviderLink }) => {
  const [copiedType, setCopiedType] = useState<'tmdb' | 'watch' | null>(null);

  if (!item) return null;

  const mediaType: 'movie' | 'tv' =
    item.media_type === 'movie'
      ? 'movie'
      : item.media_type === 'tv'
      ? 'tv'
      : item.first_air_date || (item.name && !item.title)
      ? 'tv'
      : 'movie';
  const title = item.title || item.name || 'Title';
  
  // Official TMDB website link
  const tmdbLink = `https://www.themoviedb.org/${mediaType}/${item.id}`;
  // Streaming Watch Provider link (use official TMDB provider link if passed, or fallback)
  const watchLink = watchProviderLink || `https://www.themoviedb.org/${mediaType}/${item.id}/watch`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${title} on CinePulse`,
          text: `Check out ${title} (${mediaType === 'movie' ? 'Movie' : 'TV Series'})!`,
          url: tmdbLink,
        });
      } catch (err) {
        console.log('User cancelled native share or not supported', err);
      }
    }
  };

  const copyToClipboard = (text: string, type: 'tmdb' | 'watch') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-popover text-popover-foreground border-border backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Share "{title}"</DialogTitle>
              <DialogDescription>Share official TMDB links and streaming watch provider links.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Native Share button if supported */}
          {'share' in navigator && (
            <Button variant="default" size="lg" onClick={handleNativeShare} className="w-full cursor-pointer">
              <Share2 className="h-4 w-4 mr-2" /> Share via App / Device
            </Button>
          )}

          {/* TMDB Official Link */}
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> TMDB Official Title Link
              </span>
              {copiedType === 'tmdb' && (
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <Check className="h-3 w-3" /> Copied!
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={tmdbLink}
                className="flex-1 bg-muted border border-border rounded-xl px-3 py-1.5 text-xs text-muted-foreground font-mono"
              />
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(tmdbLink, 'tmdb')} className="cursor-pointer">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <a href={tmdbLink} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="cursor-pointer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </div>

          {/* Streaming Watch Providers Link */}
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary" /> OTT Watch Provider Stream Link
              </span>
              {copiedType === 'watch' && (
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                  <Check className="h-3 w-3" /> Copied!
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={watchLink}
                className="flex-1 bg-muted border border-border rounded-xl px-3 py-1.5 text-xs text-muted-foreground font-mono"
              />
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(watchLink, 'watch')} className="cursor-pointer">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <a href={watchLink} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="ghost" className="cursor-pointer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
