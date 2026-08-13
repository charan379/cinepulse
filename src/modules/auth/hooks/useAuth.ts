import { useState, useEffect, useCallback } from 'react';
import { tmdbService, TMDBAccount } from '@/lib/tmdb';

const SESSION_KEY = 'cinepulse_tmdb_session_id';
const ACCOUNT_KEY = 'cinepulse_tmdb_account';

export function useAuth() {
  const [sessionId, setSessionId] = useState<string | null>(() => localStorage.getItem(SESSION_KEY));
  const [account, setAccount] = useState<TMDBAccount | null>(() => {
    const cached = localStorage.getItem(ACCOUNT_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch account profile when sessionId exists
  const fetchAccount = useCallback(async (sid: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const acc = await tmdbService.getAccount(sid);
      setAccount(acc);
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(acc));
    } catch (err: any) {
      console.error('Failed to fetch TMDB account profile:', err);
      // Only clear if error is unauthorized session
      if (err.message && (err.message.includes('Session') || err.message.includes('401') || err.message.includes('denied'))) {
        setAuthError(err.message || 'Session expired. Please log in again.');
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(ACCOUNT_KEY);
        setSessionId(null);
        setAccount(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionId && !account) {
      fetchAccount(sessionId);
    }
  }, [sessionId, account, fetchAccount]);

  // Initiate login by getting request token and redirecting to TMDB
  const login = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const requestToken = await tmdbService.createRequestToken();
      const currentUrl = window.location.origin + window.location.pathname;
      const authUrl = tmdbService.getAuthUrl(requestToken, currentUrl);
      // Store request token temporarily
      sessionStorage.setItem('tmdb_request_token', requestToken);
      window.location.href = authUrl;
    } catch (err: any) {
      console.error('Login initiation failed:', err);
      setAuthError('Could not start TMDB authentication. Please try again.');
      setIsLoading(false);
    }
  };

  // Complete OAuth flow if returning from TMDB with request_token
  const handleAuthCallback = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const approved = urlParams.get('approved');
    const requestToken = urlParams.get('request_token') || sessionStorage.getItem('tmdb_request_token');

    // If already logged in with a valid session ID, simply clean the URL params
    const existingSession = localStorage.getItem(SESSION_KEY);
    if (existingSession && approved === 'true') {
      sessionStorage.removeItem('tmdb_request_token');
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      return;
    }

    if (approved === 'true' && requestToken) {
      setIsLoading(true);
      setAuthError(null);
      try {
        const newSessionId = await tmdbService.createSession(requestToken);
        localStorage.setItem(SESSION_KEY, newSessionId);
        sessionStorage.removeItem('tmdb_request_token');
        setSessionId(newSessionId);
        await fetchAccount(newSessionId);
      } catch (err: any) {
        console.error('Session creation failed:', err);
        // Only set error if not already logged in
        if (!localStorage.getItem(SESSION_KEY)) {
          setAuthError(err.message || 'Failed to authorize TMDB session');
        }
      } finally {
        sessionStorage.removeItem('tmdb_request_token');
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        setIsLoading(false);
      }
    }
  }, [fetchAccount]);

  useEffect(() => {
    handleAuthCallback();
  }, [handleAuthCallback]);

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ACCOUNT_KEY);
    setSessionId(null);
    setAccount(null);
  };

  return {
    isAuthenticated: !!sessionId && !!account,
    sessionId,
    account,
    isLoading,
    authError,
    login,
    logout,
  };
}
