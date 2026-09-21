import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService, TMDBMediaItem, getTMDBImageUrl, getTMDBBackdropUrl, TMDBWatchProvider, TMDBList } from '@/lib/tmdb';
import { getDefaultUserRegion } from '@/lib/geo-region';
import { QuickMediaActions } from '@/modules/lists/components/QuickMediaActions';
import { AddToListModal } from '@/modules/lists/components/AddToListModal';
import { QueryPlaceholder } from '@/components/QueryPlaceholder';
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
  const {
    data: detail,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: errorDetail,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['media-detail', mediaType, mediaId],
    queryFn: () => tmdbService.getMediaDetail(mediaType, mediaId),
    enabled: isOpen && mediaId > 0,
    staleTime: 1000 * 60 * 15,
  });

  // Fetch TV Season details if TV series
  const {
    data: seasonDetail,
    isLoading: isLoadingSeason,
    isError: isErrorSeason,
    error: errorSeason,
    refetch: refetchSeason,
  } = useQuery({
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

  // Cast members
  const cast = detail?.credits?.cast || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="flex flex-col max-h-[92dvh] sm:max-h-[88dvh] w-[calc(100dvw-1rem)] sm:w-full max-w-3xl p-0 overflow-hidden border border-border bg-card shadow-lg sm:rounded gap-0">
          <div className="flex-1 min-h-0 overflow-y-auto w-full overscroll-contain">
            {/* Header Banner */}
            <div className="relative border-b border-border bg-muted">
              {backdropUrl && (
                <div className="relative h-36 sm:h-48 md:h-56 w-full overflow-hidden">
                  <img
                    src={backdropUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50" />
                </div>
              )}

              {/* Poster & Title Bar */}
              <div className="p-3.5 sm:p-5 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-end bg-card border-b border-border">
                {posterUrl && (
                  <div className="h-28 w-20 sm:h-36 sm:w-24 shrink-0 overflow-hidden rounded bg-muted border border-border shadow-xs -mt-10 sm:-mt-16 z-10">
                    <img src={posterUrl} alt={title} className="h-full w-full object-cover" />
                  </div>
                )}

                <div className="flex-1 space-y-2 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-foreground break-words">
                      {title}
                    </h2>

                    {(detail?.vote_average || item.vote_average) ? (
                      <Badge variant="warning" className="text-xs font-bold px-1.5 py-0.5 shrink-0">
                        <Star className="h-3 w-3 mr-0.5 fill-current" />
                        {(detail?.vote_average || item.vote_average).toFixed(1)}
                      </Badge>
                    ) : null}

                    <Badge variant="secondary" className="text-[10px] uppercase font-semibold shrink-0">
                      {mediaType === 'movie' ? 'Movie' : 'TV Series'}
                    </Badge>
                  </div>

                  {detail?.tagline && (
                    <p className="text-xs text-muted-foreground italic line-clamp-2">{detail.tagline}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {sessionId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsAddToListModalOpen(true)}
                        className="text-xs h-7 px-2.5 cursor-pointer inline-flex items-center gap-1"
                      >
                        <ListPlus className="h-3.5 w-3.5" />
                        <span>Add to List</span>
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
                      variant="full"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content Body with QueryPlaceholder */}
            <div className="p-3.5 sm:p-5 space-y-4">
            <QueryPlaceholder
              isLoading={isLoadingDetail}
              isError={isErrorDetail}
              error={errorDetail}
              onRetry={() => refetchDetail()}
              onReload={() => refetchDetail()}
              loadingText="Loading full specifications..."
              errorTitle="Failed to load details"
            >
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
                    className="ml-auto text-xs h-7 px-2.5 cursor-pointer"
                    onClick={() => setTrailerKey(officialTrailer.key)}
                  >
                    <Play className="h-3.5 w-3.5 fill-current mr-1" /> Trailer
                  </Button>
                )}
              </div>

              {/* Genres */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {genres.map((g) => (
                    <Badge key={g.id} variant="outline" className="text-[10px] px-2 py-0.5">
                      {g.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Synopsis</h3>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">{detail?.overview || item.overview || 'No synopsis available.'}</p>
              </div>

              {/* OTT Platform / Watch Providers */}
              <div className="rounded border border-border bg-card p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-primary" /> Where to Watch
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
                        <span className="text-[10px] text-muted-foreground font-semibold mb-1 block">Streaming:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {regionProviders.flatrate.map((p: TMDBWatchProvider) => (
                            <a
                              key={p.provider_id}
                              href={watchLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted border border-border hover:border-primary transition-colors cursor-pointer max-w-full"
                            >
                              <img src={getTMDBImageUrl(p.logo_path, 'w92')} alt={p.provider_name} className="h-4 w-4 rounded shrink-0" />
                              <span className="font-semibold text-[11px] text-foreground truncate">{p.provider_name}</span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {regionProviders.rent && regionProviders.rent.length > 0 && (
                      <div>
                        <span className="text-[10px] text-muted-foreground font-semibold mb-1 block">Rent / Buy:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {regionProviders.rent.map((p: TMDBWatchProvider) => (
                            <a
                              key={p.provider_id}
                              href={watchLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted border border-border hover:border-primary transition-colors cursor-pointer max-w-full"
                            >
                              <img src={getTMDBImageUrl(p.logo_path, 'w92')} alt={p.provider_name} className="h-4 w-4 rounded shrink-0" />
                              <span className="font-semibold text-[11px] text-foreground truncate">{p.provider_name}</span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
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
                <div className="space-y-3 rounded border border-border bg-card p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
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

                  {/* Episodes List with QueryPlaceholder */}
                  <QueryPlaceholder
                    isLoading={isLoadingSeason}
                    isError={isErrorSeason}
                    error={errorSeason}
                    isEmpty={!isLoadingSeason && (!seasonDetail?.episodes || seasonDetail.episodes.length === 0)}
                    onRetry={() => refetchSeason()}
                    onReload={() => refetchSeason()}
                    loadingText={`Loading Season ${selectedSeasonNumber} episodes...`}
                    errorTitle="Failed to load season episodes"
                    emptyTitle="No episode data available"
                  >
                    {seasonDetail?.episodes && (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {seasonDetail.episodes.map((ep) => (
                          <div
                            key={ep.id}
                            className="flex flex-col sm:flex-row gap-2.5 p-2 rounded bg-muted border border-border hover:bg-muted/80 transition-colors"
                          >
                            {ep.still_path ? (
                              <img
                                src={getTMDBImageUrl(ep.still_path, 'w300')}
                                alt={ep.name}
                                className="h-28 sm:h-16 w-full sm:w-28 rounded object-cover shrink-0 border border-border"
                              />
                            ) : (
                              <div className="h-16 w-full sm:w-28 rounded bg-card flex items-center justify-center text-[10px] text-muted-foreground shrink-0 border border-border">
                                No Still
                              </div>
                            )}
                            <div className="space-y-0.5 flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs font-bold text-foreground truncate">
                                  Ep {ep.episode_number}: {ep.name}
                                </h4>
                                {ep.air_date && (
                                  <span className="text-[10px] text-muted-foreground shrink-0">{ep.air_date}</span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground line-clamp-2">{ep.overview || 'No plot summary available.'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </QueryPlaceholder>
                </div>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <div className="space-y-1.5 min-w-0">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top Cast</h3>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                    {cast.slice(0, 10).map((c) => (
                      <div key={c.id} className="flex flex-col items-center w-16 text-center shrink-0">
                        <img
                          src={getTMDBImageUrl(c.profile_path, 'w185')}
                          alt={c.name}
                          className="h-12 w-12 rounded object-cover border border-border mb-1"
                        />
                        <span className="text-[10px] font-semibold text-foreground line-clamp-1">{c.name}</span>
                        <span className="text-[9px] text-muted-foreground line-clamp-1">{c.character}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {detail?.recommendations?.results && detail.recommendations.results.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border min-w-0">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Similar Titles</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {detail.recommendations.results.slice(0, 10).map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => onSelectMedia({ ...rec, media_type: rec.media_type || (rec.title ? 'movie' : 'tv') })}
                        className="w-20 group cursor-pointer shrink-0"
                      >
                        <img
                          src={getTMDBImageUrl(rec.poster_path, 'w185')}
                          alt={rec.title || rec.name || 'Title'}
                          className="h-28 w-20 rounded object-cover border border-border group-hover:border-primary transition-colors mb-1"
                        />
                        <span className="text-[10px] font-bold text-foreground line-clamp-1 block">
                          {rec.title || rec.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </QueryPlaceholder>
          </div>
        </div>

        {/* Youtube Trailer Modal Overlay */}
        {trailerKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="relative w-full max-w-3xl aspect-video rounded overflow-hidden shadow-lg border border-border">
              <button
                onClick={() => setTrailerKey(null)}
                className="absolute top-2 right-2 z-10 rounded bg-black/70 p-1 text-white hover:bg-black cursor-pointer"
              >
                <X className="h-4 w-4" />
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
