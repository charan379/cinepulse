import { useState, useCallback } from 'react';

export interface FilterState {
  mediaType: 'all' | 'movie' | 'tv';
  quickFilter: 'all' | 'watchlist' | 'favorites' | 'seen';
  genreId: number | null;
  personId: number | null;
  personName: string;
  originalLanguage: string;
  region: string;
  certificationCountry: string;
  certification: string;
  sortBy: string;
  searchQuery: string;
}

const DEFAULT_FILTERS: FilterState = {
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
};

export function useFiltersState() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const isFiltered = 
    filters.quickFilter !== 'all' ||
    filters.genreId !== null ||
    filters.personId !== null ||
    filters.originalLanguage !== '' ||
    filters.certification !== '' ||
    filters.searchQuery !== '';

  const setAllFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  return {
    filters,
    updateFilter,
    setAllFilters,
    resetFilters,
    isFiltered,
  };
}
