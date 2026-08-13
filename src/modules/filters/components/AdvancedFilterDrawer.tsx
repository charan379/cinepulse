import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tmdbService, TMDBGenre, TMDBPerson } from '@/lib/tmdb';
import { FilterState } from '../hooks/useFiltersState';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, RotateCcw, UserCheck, Search, Globe, Shield, Sparkles } from 'lucide-react';

interface AdvancedFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (draftFilters: FilterState) => void;
  onResetFilters: () => void;
}

const REGION_OPTIONS = [
  { code: 'US', name: 'United States (US)' },
  { code: 'IN', name: 'India (IN)' },
  { code: 'GB', name: 'United Kingdom (GB)' },
  { code: 'CA', name: 'Canada (CA)' },
  { code: 'AU', name: 'Australia (AU)' },
  { code: 'FR', name: 'France (FR)' },
  { code: 'DE', name: 'Germany (DE)' },
  { code: 'JP', name: 'Japan (JP)' },
  { code: 'KR', name: 'South Korea (KR)' },
];

const LANGUAGE_OPTIONS = [
  { code: '', name: 'All Languages' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Mandarin / Chinese' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
];

// Region PG Rating / Certification Presets
const CERTIFICATION_PRESETS: Record<string, string[]> = {
  US: ['G', 'PG', 'PG-13', 'R', 'NC-17'],
  IN: ['U', 'U/A', 'A'],
  GB: ['U', 'PG', '12A', '15', '18'],
  CA: ['G', 'PG', '14A', '18A', 'R'],
  AU: ['G', 'PG', 'M', 'MA15+', 'R18+'],
};

export const AdvancedFilterDrawer: React.FC<AdvancedFilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  // Local draft state so filters are only applied on clicking "Apply Filters"
  const [draft, setDraft] = useState<FilterState>(filters);
  const [personSearch, setPersonSearch] = useState('');

  // Sync draft state whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      setDraft(filters);
    }
  }, [isOpen, filters]);

  const updateDraft = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  // Fetch Genres
  const genreType = draft.mediaType === 'all' ? 'movie' : draft.mediaType;
  const { data: genres = [] } = useQuery({
    queryKey: ['genres', genreType],
    queryFn: () => tmdbService.getGenres(genreType),
    staleTime: 1000 * 60 * 60,
  });

  // Search Cast / Director
  const { data: personResults = [] } = useQuery({
    queryKey: ['search-person', personSearch],
    queryFn: () => tmdbService.searchPerson(personSearch),
    enabled: personSearch.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  const availableCertifications = CERTIFICATION_PRESETS[draft.certificationCountry] || CERTIFICATION_PRESETS['US'];

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    setDraft({
      mediaType: 'all',
      quickFilter: 'all',
      genreId: null,
      personId: null,
      personName: '',
      originalLanguage: '',
      region: 'US',
      certificationCountry: 'US',
      certification: '',
      sortBy: 'popularity.desc',
      searchQuery: '',
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-popover border-border text-popover-foreground">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <SheetTitle>Filter & Discover</SheetTitle>
                <SheetDescription>Refine titles by genre, cast, language, and region ratings.</SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 my-6">
          {/* Quick Status Filters */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Lists Filter</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={draft.quickFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateDraft('quickFilter', 'all')}
                className="justify-start text-xs cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" /> All Titles
              </Button>
              <Button
                variant={draft.quickFilter === 'watchlist' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateDraft('quickFilter', 'watchlist')}
                className="justify-start text-xs cursor-pointer"
              >
                In My Watchlist
              </Button>
              <Button
                variant={draft.quickFilter === 'favorites' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateDraft('quickFilter', 'favorites')}
                className="justify-start text-xs cursor-pointer"
              >
                My Favorites
              </Button>
              <Button
                variant={draft.quickFilter === 'seen' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateDraft('quickFilter', 'seen')}
                className="justify-start text-xs cursor-pointer"
              >
                Have Seen
              </Button>
            </div>
          </div>

          {/* Media Format */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Media Format</label>
            <div className="flex gap-2">
              <Button
                variant={draft.mediaType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  updateDraft('mediaType', 'all');
                  updateDraft('genreId', null);
                }}
                className="flex-1 text-xs cursor-pointer"
              >
                All Formats
              </Button>
              <Button
                variant={draft.mediaType === 'movie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  updateDraft('mediaType', 'movie');
                  updateDraft('genreId', null);
                }}
                className="flex-1 text-xs cursor-pointer"
              >
                Movies
              </Button>
              <Button
                variant={draft.mediaType === 'tv' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  updateDraft('mediaType', 'tv');
                  updateDraft('genreId', null);
                }}
                className="flex-1 text-xs cursor-pointer"
              >
                TV Series
              </Button>
            </div>
          </div>

          {/* Genre Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Genre</label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-muted border border-border">
              <Badge
                variant={draft.genreId === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => updateDraft('genreId', null)}
              >
                All Genres
              </Badge>
              {genres.map((g: TMDBGenre) => (
                <Badge
                  key={g.id}
                  variant={draft.genreId === g.id ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => updateDraft('genreId', draft.genreId === g.id ? null : g.id)}
                >
                  {g.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Cast & Director Search */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-primary" /> Cast or Director
            </label>
            {draft.personId ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/15 border border-primary/30">
                <span className="text-xs font-semibold text-foreground">With: {draft.personName}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] cursor-pointer"
                  onClick={() => {
                    updateDraft('personId', null);
                    updateDraft('personName', '');
                    setPersonSearch('');
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Type actor or director name..."
                    value={personSearch}
                    onChange={(e) => setPersonSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {personResults.length > 0 && (
                  <div className="max-h-32 overflow-y-auto rounded-xl bg-popover border border-border p-1 space-y-1">
                    {personResults.slice(0, 5).map((p: TMDBPerson) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          updateDraft('personId', p.id);
                          updateDraft('personName', p.name);
                          setPersonSearch('');
                        }}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted cursor-pointer text-xs"
                      >
                        <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                          {p.name[0]}
                        </div>
                        <span className="font-medium text-foreground">{p.name}</span>
                        {p.known_for_department && (
                          <span className="text-[10px] text-muted-foreground ml-auto">({p.known_for_department})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Region & PG Rating Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-primary" /> PG Rating by Region
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-muted-foreground mb-1 block">Select Country</span>
                <Select
                  value={draft.certificationCountry}
                  onValueChange={(val) => {
                    updateDraft('certificationCountry', val);
                    updateDraft('certification', '');
                  }}
                >
                  <SelectTrigger className="text-xs h-9 cursor-pointer">
                    <SelectValue placeholder="Country" />
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

              <div>
                <span className="text-[11px] text-muted-foreground mb-1 block">PG / Certification</span>
                <Select
                  value={draft.certification || 'ANY'}
                  onValueChange={(val) => updateDraft('certification', val === 'ANY' ? '' : val)}
                >
                  <SelectTrigger className="text-xs h-9 cursor-pointer">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ANY">Any Rating</SelectItem>
                    {availableCertifications.map((cert) => (
                      <SelectItem key={cert} value={cert}>
                        {cert}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-primary" /> Original Language
            </label>
            <Select
              value={draft.originalLanguage || 'ALL'}
              onValueChange={(val) => updateDraft('originalLanguage', val === 'ALL' ? '' : val)}
            >
              <SelectTrigger className="text-xs cursor-pointer">
                <SelectValue placeholder="Original Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((l) => (
                  <SelectItem key={l.code || 'ALL'} value={l.code || 'ALL'}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleReset} className="w-1/2 cursor-pointer">
            <RotateCcw className="h-4 w-4" /> Reset All
          </Button>
          <Button variant="default" onClick={handleApply} className="w-1/2 cursor-pointer">
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
