import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService, TMDBMediaItem, getTMDBImageUrl, getTMDBBackdropUrl, TMDBWatchProvider, TMDBList } from '@/lib/tmdb';
import { getDefaultUserRegion } from '@/lib/geo-region';
import { QuickMediaActions } from '@/modules/lists/components/QuickMediaActions';
import { AddToListModal } from '@/modules/lists/components/AddToListModal';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Clock, Calendar, Tv, Play, Globe, X, ExternalLink, ListPlus } from 'lucide-react';

interface MediaDetailModalProps {
  item: TMDBMediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string | null;
  accountId?: number | null;
  userLists?: TMDBList[];
  onToggleWatchlist: (params: { mediaType: 'movie' | 'tv'; mediaId: number; watchlist: boolean }) => Promise<any>;
  onToggleFavorite: (params: { mediaType: 'movie' | 'tv'; mediaId: number; favorite: boolean }) => Promise<any>;
  onToggleSeen: (params: { mediaType: 'movie' | 'tv'; mediaId: number; isSeen: boolean }) => Promise<any>;
  onSelectMedia: (item: TMDBMediaItem) => void;
  onOpenCreateListModal?: () => void;
}

const REGION_OPTIONS = [
  { code: 'US', name: 'United States 🇺🇸' },
  { code: 'IN', name: 'India 🇮🇳' },
  { code: 'GB', name: 'United Kingdom 🇬🇧' },
  { code: 'CA', name: 'Canada 🇨🇦' },
  { code: 'AU', name: 'Australia 🇦🇺' },
  { code: 'FR', name: 'France 🇫🇷' },
  { code: 'DE', name: 'Germany 🇩🇪' },
  { code: 'JP', name: 'Japan 🇯🇵' },
  { code: 'KR', name: 'South Korea 🇰🇷' },
];

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  sessionId,
  accountId,
  userLists = [],
  onToggleWatchlist,
  onToggleFavorite,
  onToggleSeen,
  onSelectMedia,
  onOpenCreateListModal,
}) => {
  // Auto-detect default region from browser timezone/locale
  const [selectedRegion, setSelectedRegion] = useState<string>(() => getDefaultUserRegion());
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState<boolean>(false);

  // Sync auto-detected region when modal opens
  useEffect(() => {
    if (isOpen) {
      const userGeoRegion = getDefaultUserRegion();
      setSelectedRegion(userGeoRegion);
    }
  }, [isOpen]);

  // Reset season dropdown to Season 1 when selected title changes
  useEffect(() => {
    setSelectedSeasonNumber(1);
  }, [item?.id]);

  const mediaType: 'movie' | 'tv' =
    item?.media_type === 'movie'
      ? 'movie'
      : item?.media_type === 'tv'
        ? 'tv'
        : item?.first_air_date || (item?.name && !item?.title)
          ? 'tv'
          : 'movie';
  const mediaId = item?.id || 0;

  // Fetch full details with append_to_response
  const { data: detail } = useQuery({
    queryKey: ['media-detail', mediaType, mediaId],
    queryFn: () => tmdbService.getMediaDetail(mediaType, mediaId),
    enabled: isOpen && mediaId > 0,
    staleTime: 1000 * 60 * 15,
  });

  // Fetch TV Season details if TV series
  const { data: seasonDetail, isLoading: isLoadingSeason } = useQuery({
    queryKey: ['tv-season', mediaId, selectedSeasonNumber],
    queryFn: () => tmdbService.getTVSeasonDetail(mediaId, selectedSeasonNumber),
    enabled: isOpen && mediaType === 'tv' && mediaId > 0 && selectedSeasonNumber !== undefined,
    staleTime: 1000 * 60 * 15,
  });

  if (!item) return null;

  const title = detail?.title || detail?.name || item.title || item.name || 'Untitled';
  const backdropUrl = getTMDBBackdropUrl(detail?.backdrop_path || item.backdrop_path, 'original');
  const posterUrl = getTMDBImageUrl(detail?.poster_path || item.poster_path, 'w500');

  const releaseDate = detail?.release_date || detail?.first_air_date || item.release_date || item.first_air_date;
  const runtime = detail?.runtime;
  const genres = detail?.genres || [];

  // OTT / Watch Providers for selected region (fallback to US if missing)
  const watchProvidersResults = detail?.['watch/providers']?.results || {};
  const regionProviders = watchProvidersResults[selectedRegion] || watchProvidersResults['US'];
  const watchLink = regionProviders?.link || `https://www.themoviedb.org/${mediaType}/${mediaId}/watch`;

  // Trailers / Videos
  const videos = detail?.videos?.results || [];
  const officialTrailer = videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];

  const cast = detail?.credits?.cast || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl w-[95vw] p-0 overflow-hidden bg-popover text-popover-foreground border border-border shadow-2xl backdrop-blur-2xl rounded-2xl sm:rounded-3xl max-h-[90vh] flex flex-col">
          {/* Header Hero Backdrop */}
          <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-muted shrink-0">
            <img src={backdropUrl} alt={title} className="h-full w-full object-cover" />

            {/* Adaptive Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-popover via-popover/40 to-transparent" />

            {/* Quick actions top bar */}
            <div className="absolute bottom-3 left-4 right-4 z-10 flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={posterUrl}
                  alt={title}
                  className="h-24 w-16 sm:h-32 sm:w-22 rounded-xl object-cover border border-border shadow-lg -mb-4 shrink-0"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="violet" className="uppercase text-[9px] px-1.5 py-0.2 tracking-wider">
                      {mediaType}
                    </Badge>
                    {detail?.vote_average ? (
                      <Badge variant="gold" className="text-[10px] px-1.5 py-0.2">
                        <Star className="h-2.5 w-2.5 fill-amber-400 mr-0.5" />
                        {detail.vote_average.toFixed(1)}
                      </Badge>
                    ) : null}
                  </div>
                  <h2 className="text-base sm:text-2xl font-extrabold text-foreground line-clamp-1">
                    {title}
                  </h2>
                  {detail?.tagline && (
                    <p className="text-[11px] italic text-muted-foreground line-clamp-1">"{detail.tagline}"</p>
                  )}
                </div>
              </div>

              {/* Account Quick Actions & Share */}
              <div className="flex items-center gap-2">
                {sessionId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddToListModalOpen(true)}
                    className="h-8 text-xs px-2.5 cursor-pointer bg-card border-border hover:bg-muted"
                  >
                    <ListPlus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Add to List</span>
                  </Button>
                )}

                <QuickMediaActions
                  mediaType={mediaType}
                  mediaId={mediaId}
                  mediaTitle={title}
                  sessionId={sessionId}
                  accountId={accountId}
                  onToggleWatchlist={onToggleWatchlist}
                  onToggleFavorite={onToggleFavorite}
                  onToggleSeen={onToggleSeen}
                  variant="full"
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-b border-border pb-3">
              {releaseDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> {releaseDate}
                </span>
              )}
              {runtime ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" /> {runtime} mins
                </span>
              ) : null}
              {detail?.number_of_seasons ? (
                <span className="flex items-center gap-1 font-semibold text-primary">
                  <Tv className="h-3.5 w-3.5" /> {detail.number_of_seasons} Seasons ({detail.number_of_episodes} Eps)
                </span>
              ) : null}

              {/* Trailer Action */}
              {officialTrailer && (
                <Button
                  size="sm"
                  variant="default"
                  className="ml-auto text-xs h-7 px-3 cursor-pointer"
                  onClick={() => setTrailerKey(officialTrailer.key)}
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Watch Trailer
                </Button>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genres.map((g) => (
                  <Badge key={g.id} variant="outline" className="text-[11px] px-2 py-0.2">
                    {g.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <div className="space-y-1">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Synopsis</h3>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed">{detail?.overview || item.overview}</p>
            </div>

            {/* OTT Platform / Watch Providers Section (Clickable Provider Cards) */}
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-primary" /> Streaming Watch Providers
                </h3>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-36 h-7 text-xs">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGION_OPTIONS.map((r) => (
                      <SelectItem key={r.code} value={r.code}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {regionProviders ? (
                <div className="space-y-2 text-xs">
                  {regionProviders.flatrate && regionProviders.flatrate.length > 0 && (
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold mb-1 block">Stream On (Click to Watch):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {regionProviders.flatrate.map((p: TMDBWatchProvider) => (
                          <a
                            key={p.provider_id}
                            href={watchLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border hover:bg-muted/80 hover:border-primary/40 transition-all group cursor-pointer"
                          >
                            <img src={getTMDBImageUrl(p.logo_path, 'w92')} alt={p.provider_name} className="h-5 w-5 rounded" />
                            <span className="font-semibold text-[11px] text-foreground group-hover:text-primary transition-colors">{p.provider_name}</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-60 group-hover:opacity-100" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {regionProviders.rent && regionProviders.rent.length > 0 && (
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold mb-1 block">Rent On (Click to Rent):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {regionProviders.rent.map((p: TMDBWatchProvider) => (
                          <a
                            key={p.provider_id}
                            href={watchLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border hover:bg-muted/80 hover:border-primary/40 transition-all group cursor-pointer"
                          >
                            <img src={getTMDBImageUrl(p.logo_path, 'w92')} alt={p.provider_name} className="h-5 w-5 rounded" />
                            <span className="font-semibold text-[11px] text-foreground group-hover:text-primary transition-colors">{p.provider_name}</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-60 group-hover:opacity-100" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {!regionProviders.flatrate && !regionProviders.rent && (
                    <p className="text-xs text-muted-foreground italic">No direct streaming provider found for this region.</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No watch provider data available for selected region.</p>
              )}
            </div>

            {/* TV Shows Season & Episode Details Browser */}
            {mediaType === 'tv' && detail?.seasons && detail.seasons.length > 0 && (
              <div className="space-y-3 rounded-xl border border-border bg-card p-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Tv className="h-3.5 w-3.5 text-primary" /> Season & Episode Explorer
                  </h3>
                  <Select
                    value={String(selectedSeasonNumber)}
                    onValueChange={(val) => setSelectedSeasonNumber(Number(val))}
                  >
                    <SelectTrigger className="w-36 h-7 text-xs">
                      <SelectValue placeholder="Season" />
                    </SelectTrigger>
                    <SelectContent>
                      {detail.seasons.map((s) => (
                        <SelectItem key={s.id} value={String(s.season_number)}>
                          {s.name} ({s.episode_count} eps)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Episodes List */}
                {isLoadingSeason ? (
                  <div className="p-3 text-center text-xs text-muted-foreground">Loading episodes...</div>
                ) : seasonDetail?.episodes && seasonDetail.episodes.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {seasonDetail.episodes.map((ep) => (
                      <div
                        key={ep.id}
                        className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-lg bg-muted border border-border hover:bg-muted/80 transition-colors"
                      >
                        {ep.still_path ? (
                          <img
                            src={getTMDBImageUrl(ep.still_path, 'w300')}
                            alt={ep.name}
                            className="h-20 w-full sm:w-32 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-20 w-full sm:w-32 rounded bg-card flex items-center justify-center text-[10px] text-muted-foreground shrink-0 border border-border">
                            No Still
                          </div>
                        )}
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-foreground">
                              Ep {ep.episode_number}: {ep.name}
                            </h4>
                            {ep.air_date && (
                              <span className="text-[10px] text-muted-foreground">{ep.air_date}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{ep.overview || 'No plot summary available.'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-muted-foreground">No episode data available for this season.</div>
                )}
              </div>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <div className="space-y-1.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Top Cast</h3>
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {cast.slice(0, 10).map((c) => (
                    <div key={c.id} className="flex flex-col items-center w-16 text-center shrink-0">
                      <img
                        src={getTMDBImageUrl(c.profile_path, 'w185')}
                        alt={c.name}
                        className="h-12 w-12 rounded-full object-cover border border-border shadow-xs mb-1"
                      />
                      <span className="text-[10px] font-semibold text-foreground line-clamp-1">{c.name}</span>
                      <span className="text-[8px] text-muted-foreground line-clamp-1">{c.character}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations / More Like This */}
            {detail?.recommendations?.results && detail.recommendations.results.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">More Like This</h3>
                <div className="flex gap-2.5 overflow-x-auto pb-2">
                  {detail.recommendations.results.slice(0, 12).map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => onSelectMedia({ ...rec, media_type: rec.media_type || (rec.title ? 'movie' : 'tv') })}
                      className="w-24 group cursor-pointer shrink-0 transition-transform hover:scale-105"
                    >
                      <img
                        src={getTMDBImageUrl(rec.poster_path, 'w185')}
                        alt={rec.title || rec.name || 'Title'}
                        className="h-36 w-24 rounded-xl object-cover border border-border shadow-xs group-hover:border-primary transition-all mb-1"
                      />
                      <span className="text-[10px] font-bold text-foreground line-clamp-1 block">
                        {rec.title || rec.name}
                      </span>
                      {rec.vote_average ? (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                          {rec.vote_average.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Youtube Trailer Modal Overlay */}
          {trailerKey && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
              <div className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border">
                <button
                  onClick={() => setTrailerKey(null)}
                  className="absolute top-2.5 right-2.5 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-white/20 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
                <iframe
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                  title="Trailer"
                  className="h-full w-full border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add / Remove from Custom Lists Modal */}
      <AddToListModal
        mediaItem={item}
        isOpen={isAddToListModalOpen}
        onClose={() => setIsAddToListModalOpen(false)}
        sessionId={sessionId}
        accountId={accountId}
        lists={userLists}
        onOpenCreateListModal={onOpenCreateListModal}
      />
    </>
  );
};
