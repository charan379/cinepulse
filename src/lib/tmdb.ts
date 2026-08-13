// TMDB API v3 & v4 Client

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// TMDB API v4 Read Access Token (from environment variable VITE_TMDB_READ_TOKEN)
const TMDB_READ_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN || 
  "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMWNjNTA2ZjJiYjI0ZTI3NDAyYWUwNWIxNDQ1MjE1NCIsIm5iZiI6MTY3MzUwMDE2OS4xNiwic3ViIjoiNjNiZjk2MDk4ZWZlNzMwMDk0ODhhMmFhIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.EGmJSBTzutC8qkAwRwpTjo6-V9WS50pjNgKfbm7REco";

// Extract matching TMDB API Key (aud) dynamically from VITE_TMDB_READ_TOKEN
function getAPIKeyFromReadToken(token: string): string {
  if (import.meta.env.VITE_TMDB_API_KEY) {
    return import.meta.env.VITE_TMDB_API_KEY;
  }
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const base64Url = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64Url));
      if (payload.aud) return payload.aud;
    }
  } catch (e) {
    console.warn('Failed to parse API key from read token:', e);
  }
  return "b1cc506f2bb24e27402ae05b14452154";
}

const TMDB_API_KEY = getAPIKeyFromReadToken(TMDB_READ_TOKEN);

export interface TMDBAccount {
  id: number;
  name: string;
  username: string;
  avatar?: {
    tmdb?: {
      avatar_path?: string;
    };
    gravatar?: {
      hash?: string;
    };
  };
  include_adult: boolean;
  iso_639_1: string;
  iso_3166_1: string;
}

export interface TMDBMediaItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type?: 'movie' | 'tv' | 'person';
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  popularity: number;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  origin_country?: string[];
  original_language?: string;
}

export interface TMDBList {
  id: number;
  name: string;
  description: string;
  item_count: number;
  favorite_count: number;
  list_type: string;
  poster_path: string | null;
  iso_639_1: string;
}

export interface TMDBListDetail extends TMDBList {
  created_by: string;
  items: TMDBMediaItem[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBPerson {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
}

export interface TMDBWatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface TMDBWatchProvidersByRegion {
  link?: string;
  flatrate?: TMDBWatchProvider[];
  rent?: TMDBWatchProvider[];
  buy?: TMDBWatchProvider[];
  free?: TMDBWatchProvider[];
  ads?: TMDBWatchProvider[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number;
  guest_stars?: TMDBPerson[];
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  poster_path: string | null;
  episodes?: TMDBEpisode[];
}

export interface TMDBMediaDetail extends TMDBMediaItem {
  tagline?: string;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TMDBSeason[];
  status?: string;
  budget?: number;
  revenue?: number;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; department: string; profile_path: string | null }[];
  };
  videos?: {
    results: { id: string; key: string; name: string; site: string; type: string }[];
  };
  'watch/providers'?: {
    results: Record<string, TMDBWatchProvidersByRegion>;
  };
  recommendations?: {
    results: TMDBMediaItem[];
  };
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Fetch helper using VITE_TMDB_READ_TOKEN Bearer Authorization or api_key
async function tmdbFetch<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  url.searchParams.set('api_key', TMDB_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const headers: HeadersInit = {
    'Content-Type': 'application/json;charset=utf-8',
  };

  if (!endpoint.startsWith('/authentication') && !params.session_id) {
    headers['Authorization'] = `Bearer ${TMDB_READ_TOKEN}`;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.status_message || `TMDB API error: ${response.status}`);
  }

  return response.json();
}

// Post helper using session_id + api_key for user write permissions (resolving TMDB status_code 36)
async function tmdbPost<T>(endpoint: string, body: any, params: Record<string, any> = {}, method = 'POST'): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);

  url.searchParams.set('api_key', TMDB_API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const headers: HeadersInit = {
    'Content-Type': 'application/json;charset=utf-8',
  };

  if (!endpoint.startsWith('/authentication') && !params.session_id) {
    headers['Authorization'] = `Bearer ${TMDB_READ_TOKEN}`;
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.status_message || `TMDB API post error: ${response.status}`);
  }

  return response.json();
}

// TMDB Image Helpers
export function getTMDBImageUrl(path: string | null, size: 'w92' | 'w185' | 'w300' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getTMDBBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1280&q=80';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// TMDB API Service
export const tmdbService = {
  // Authentication
  async createRequestToken(): Promise<string> {
    const res = await tmdbFetch<{ success: boolean; request_token: string }>('/authentication/token/new');
    return res.request_token;
  },

  getAuthUrl(requestToken: string, redirectTo: string): string {
    return `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${encodeURIComponent(redirectTo)}`;
  },

  async createSession(requestToken: string): Promise<string> {
    const res = await tmdbPost<{ success: boolean; session_id: string }>('/authentication/session/new', {
      request_token: requestToken,
    });
    return res.session_id;
  },

  async getAccount(sessionId: string): Promise<TMDBAccount> {
    return tmdbFetch<TMDBAccount>('/account', { session_id: sessionId });
  },

  // User Custom Lists
  async getUserLists(accountId: number, sessionId: string, page = 1): Promise<PaginatedResponse<TMDBList>> {
    return tmdbFetch<PaginatedResponse<TMDBList>>(`/account/${accountId}/lists`, {
      session_id: sessionId,
      page,
    });
  },

  async getListDetail(listId: string | number): Promise<TMDBListDetail> {
    try {
      const res = await tmdbFetch<any>(`/list/${listId}`);
      let itemsList: TMDBMediaItem[] = res.items || res.results || [];
      
      const totalPages = res.total_pages || Math.ceil((res.item_count || itemsList.length) / 20);
      if (totalPages > 1) {
        const pagesToFetch = Array.from({ length: Math.min(totalPages, 25) - 1 }, (_, i) => i + 2);
        const extraPages = await Promise.all(
          pagesToFetch.map((p) =>
            tmdbFetch<any>(`/list/${listId}`, { page: p }).catch(() => null)
          )
        );
        extraPages.forEach((pageRes) => {
          if (pageRes && (pageRes.items || pageRes.results)) {
            itemsList = itemsList.concat(pageRes.items || pageRes.results);
          }
        });
      }

      return {
        id: Number(listId),
        name: res.name || 'Custom List',
        description: res.description || '',
        item_count: res.item_count || itemsList.length,
        favorite_count: res.favorite_count || 0,
        list_type: res.list_type || 'custom',
        poster_path: res.poster_path || (itemsList[0]?.poster_path || null),
        iso_639_1: res.iso_639_1 || 'en',
        created_by: res.created_by || '',
        items: itemsList,
      };
    } catch (e) {
      const v4Url = `https://api.themoviedb.org/4/list/${listId}`;
      const v4Res = await fetch(v4Url, {
        headers: {
          'Authorization': `Bearer ${TMDB_READ_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
      });
      if (v4Res.ok) {
        const v4Data = await v4Res.json();
        let v4Items = v4Data.results || v4Data.items || [];
        const totalPages = v4Data.total_pages || 1;

        if (totalPages > 1) {
          const pagesToFetch = Array.from({ length: Math.min(totalPages, 25) - 1 }, (_, i) => i + 2);
          const extraPages = await Promise.all(
            pagesToFetch.map((p) =>
              fetch(`${v4Url}?page=${p}`, {
                headers: {
                  'Authorization': `Bearer ${TMDB_READ_TOKEN}`,
                  'Content-Type': 'application/json;charset=utf-8',
                },
              }).then((r) => r.json()).catch(() => null)
            )
          );
          extraPages.forEach((pRes) => {
            if (pRes && (pRes.results || pRes.items)) {
              v4Items = v4Items.concat(pRes.results || pRes.items);
            }
          });
        }

        return {
          id: Number(listId),
          name: v4Data.name || 'Custom List',
          description: v4Data.description || '',
          item_count: v4Data.total_results || v4Items.length,
          favorite_count: 0,
          list_type: 'custom',
          poster_path: v4Data.backdrop_path || v4Data.poster_path || (v4Items[0]?.poster_path || null),
          iso_639_1: 'en',
          created_by: v4Data.created_by?.name || '',
          items: v4Items,
        };
      }
      throw e;
    }
  },

  // TMDB v4 Server Paginated GET /4/list/{list_id}?page={page}
  async getListDetailPaginated(listId: string | number, page = 1): Promise<{
    id: number;
    name: string;
    description: string;
    page: number;
    total_pages: number;
    total_results: number;
    items: TMDBMediaItem[];
  }> {
    try {
      const url = new URL(`https://api.themoviedb.org/4/list/${listId}`);
      url.searchParams.set('page', String(page));

      const res = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${TMDB_READ_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
      });

      if (res.ok) {
        const data = await res.json();
        return {
          id: Number(listId),
          name: data.name || 'Custom List',
          description: data.description || '',
          page: data.page || page,
          total_pages: data.total_pages || 1,
          total_results: data.total_results || (data.results?.length || 0),
          items: data.results || data.items || [],
        };
      }
    } catch (e) {
      // Fallback
    }

    const v3Res = await tmdbFetch<any>(`/list/${listId}`, { page });
    const itemsList = v3Res.items || v3Res.results || [];
    return {
      id: Number(listId),
      name: v3Res.name || 'Custom List',
      description: v3Res.description || '',
      page: v3Res.page || page,
      total_pages: v3Res.total_pages || Math.ceil((v3Res.item_count || itemsList.length) / 20) || 1,
      total_results: v3Res.item_count || itemsList.length,
      items: itemsList,
    };
  },

  // TMDB v4 Official Check Item Status API: GET /4/list/{list_id}/item_status?media_id={media_id}&media_type={media_type}
  async checkItemInList(listId: number, mediaId: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<boolean> {
    try {
      const url = new URL(`https://api.themoviedb.org/4/list/${listId}/item_status`);
      url.searchParams.set('media_id', String(mediaId));
      url.searchParams.set('media_type', mediaType);

      const res = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${TMDB_READ_TOKEN}`,
          'Content-Type': 'application/json;charset=utf-8',
        },
      });

      if (res.ok) {
        const data = await res.json();
        return data.success === true || data.status_code === 1;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  async createList(sessionId: string, name: string, description = ''): Promise<{ success: boolean; list_id: number }> {
    return tmdbPost<{ success: boolean; list_id: number }>('/list', {
      name,
      description,
      language: 'en',
    }, { session_id: sessionId });
  },

  async addListItem(sessionId: string, listId: number, mediaId: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<{ success: boolean }> {
    try {
      const v4Url = `https://api.themoviedb.org/4/list/${listId}/items?api_key=${TMDB_API_KEY}&session_id=${sessionId}`;
      const v4Res = await fetch(v4Url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          items: [{ media_type: mediaType, media_id: Number(mediaId) }]
        })
      });
      if (v4Res.ok) {
        return { success: true };
      }
    } catch (e) {
      // Fallback
    }

    return tmdbPost<{ success: boolean }>(`/list/${listId}/add_item`, {
      media_id: Number(mediaId),
    }, { session_id: sessionId });
  },

  async removeListItem(sessionId: string, listId: number, mediaId: number, mediaType: 'movie' | 'tv' = 'movie'): Promise<{ success: boolean }> {
    try {
      const v4Url = `https://api.themoviedb.org/4/list/${listId}/items?api_key=${TMDB_API_KEY}&session_id=${sessionId}`;
      const v4Res = await fetch(v4Url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          items: [{ media_type: mediaType, media_id: Number(mediaId) }]
        })
      });
      if (v4Res.ok) {
        return { success: true };
      }
    } catch (e) {
      // Fallback
    }

    return tmdbPost<{ success: boolean }>(`/list/${listId}/remove_item`, {
      media_id: Number(mediaId),
    }, { session_id: sessionId });
  },

  async deleteList(sessionId: string, listId: number): Promise<{ success: boolean }> {
    return tmdbPost<{ success: boolean }>(`/list/${listId}`, {}, { session_id: sessionId }, 'DELETE');
  },

  // Account Watchlist & Favorites & Ratings (Seen)
  async getWatchlist(accountId: number, sessionId: string, mediaType: 'movies' | 'tv', page = 1): Promise<PaginatedResponse<TMDBMediaItem>> {
    return tmdbFetch<PaginatedResponse<TMDBMediaItem>>(`/account/${accountId}/watchlist/${mediaType}`, {
      session_id: sessionId,
      page,
      sort_by: 'created_at.desc',
    });
  },

  async getFavorites(accountId: number, sessionId: string, mediaType: 'movies' | 'tv', page = 1): Promise<PaginatedResponse<TMDBMediaItem>> {
    return tmdbFetch<PaginatedResponse<TMDBMediaItem>>(`/account/${accountId}/favorite/${mediaType}`, {
      session_id: sessionId,
      page,
      sort_by: 'created_at.desc',
    });
  },

  async getRated(accountId: number, sessionId: string, mediaType: 'movies' | 'tv', page = 1): Promise<PaginatedResponse<TMDBMediaItem>> {
    return tmdbFetch<PaginatedResponse<TMDBMediaItem>>(`/account/${accountId}/rated/${mediaType}`, {
      session_id: sessionId,
      page,
      sort_by: 'created_at.desc',
    });
  },

  async toggleWatchlist(accountId: number, sessionId: string, mediaType: 'movie' | 'tv', mediaId: number, watchlist: boolean): Promise<{ success: boolean }> {
    return tmdbPost<{ success: boolean }>(`/account/${accountId}/watchlist`, {
      media_type: mediaType,
      media_id: mediaId,
      watchlist,
    }, { session_id: sessionId });
  },

  async toggleFavorite(accountId: number, sessionId: string, mediaType: 'movie' | 'tv', mediaId: number, favorite: boolean): Promise<{ success: boolean }> {
    return tmdbPost<{ success: boolean }>(`/account/${accountId}/favorite`, {
      media_type: mediaType,
      media_id: mediaId,
      favorite,
    }, { session_id: sessionId });
  },

  async rateMedia(sessionId: string, mediaType: 'movie' | 'tv', mediaId: number, rating: number): Promise<{ success: boolean }> {
    return tmdbPost<{ success: boolean }>(`/${mediaType}/${mediaId}/rating`, {
      value: rating,
    }, { session_id: sessionId });
  },

  async deleteRating(sessionId: string, mediaType: 'movie' | 'tv', mediaId: number): Promise<{ success: boolean }> {
    return tmdbPost<{ success: boolean }>(`/${mediaType}/${mediaId}/rating`, {}, { session_id: sessionId }, 'DELETE');
  },

  // Account States (checks if movie/tv is in user's watchlist/favorite/rated)
  async getAccountStates(mediaType: 'movie' | 'tv', mediaId: number, sessionId: string): Promise<{ id: number; favorite: boolean; watchlist: boolean; rated: boolean | { value: number } }> {
    return tmdbFetch<{ id: number; favorite: boolean; watchlist: boolean; rated: boolean | { value: number } }>(`/${mediaType}/${mediaId}/account_states`, {
      session_id: sessionId,
    });
  },

  // Media Discovery & Lists
  async getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'day', page = 1): Promise<PaginatedResponse<TMDBMediaItem>> {
    return tmdbFetch<PaginatedResponse<TMDBMediaItem>>(`/trending/${mediaType}/${timeWindow}`, { page });
  },

  async getPopular(mediaType: 'movie' | 'tv' = 'movie', page = 1): Promise<PaginatedResponse<TMDBMediaItem>> {
    return tmdbFetch<PaginatedResponse<TMDBMediaItem>>(`/${mediaType}/popular`, { page });
  },

  async getTopRated(mediaType: 'movie' | 'tv' = 'movie', page = 1): Promise<PaginatedResponse<TMDBMediaItem>> {
    return tmdbFetch<PaginatedResponse<TMDBMediaItem>>(`/${mediaType}/top_rated`, { page });
  },

  async getUpcomingMovies(page = 1): Promise<PaginatedResponse<TMDBMediaItem>> {
    return tmdbFetch<PaginatedResponse<TMDBMediaItem>>('/movie/upcoming', { page });
  },

  async getDiscover(mediaType: 'movie' | 'tv', filters: Record<string, any> = {}, page = 1): Promise<PaginatedResponse<TMDBMediaItem>> {
    return tmdbFetch<PaginatedResponse<TMDBMediaItem>>(`/discover/${mediaType}`, {
      page,
      sort_by: filters.sort_by || 'popularity.desc',
      with_genres: filters.with_genres,
      with_cast: filters.with_cast,
      with_crew: filters.with_crew,
      with_original_language: filters.with_original_language,
      primary_release_year: filters.primary_release_year,
      first_air_date_year: filters.first_air_date_year,
      watch_region: filters.watch_region,
      with_watch_providers: filters.with_watch_providers,
      certification_country: filters.certification_country,
      certification: filters.certification,
      'vote_average.gte': filters.vote_average_gte,
    });
  },

  async getCertifications(mediaType: 'movie' | 'tv'): Promise<Record<string, { certification: string; meaning: string; order: number }[]>> {
    const res = await tmdbFetch<{ certifications: Record<string, { certification: string; meaning: string; order: number }[]> }>(`/certification/${mediaType}/list`);
    return res.certifications;
  },

  // Media Details & TV Seasons/Episodes
  async getMediaDetail(mediaType: 'movie' | 'tv', id: number): Promise<TMDBMediaDetail> {
    return tmdbFetch<TMDBMediaDetail>(`/${mediaType}/${id}`, {
      append_to_response: 'credits,videos,images,recommendations,similar,watch/providers',
    });
  },

  async getTVSeasonDetail(seriesId: number, seasonNumber: number): Promise<TMDBSeason> {
    return tmdbFetch<TMDBSeason>(`/tv/${seriesId}/season/${seasonNumber}`);
  },

  // Reference Data
  async getGenres(mediaType: 'movie' | 'tv'): Promise<TMDBGenre[]> {
    const res = await tmdbFetch<{ genres: TMDBGenre[] }>(`/genre/${mediaType}/list`);
    return res.genres;
  },

  async searchPerson(query: string): Promise<TMDBPerson[]> {
    if (!query || query.trim().length < 2) return [];
    const res = await tmdbFetch<PaginatedResponse<TMDBPerson>>('/search/person', { query });
    return res.results;
  },

  async searchMulti(query: string, page = 1): Promise<PaginatedResponse<TMDBMediaItem>> {
    return tmdbFetch<PaginatedResponse<TMDBMediaItem>>('/search/multi', { query, page });
  },

  async getLanguages(): Promise<{ iso_639_1: string; english_name: string; name: string }[]> {
    return tmdbFetch<{ iso_639_1: string; english_name: string; name: string }[]>('/configuration/languages');
  },

  async getWatchProviderRegions(): Promise<{ iso_3166_1: string; english_name: string; native_name: string }[]> {
    const res = await tmdbFetch<{ results: { iso_3166_1: string; english_name: string; native_name: string }[] }>('/watch/providers/regions');
    return res.results;
  }
};
