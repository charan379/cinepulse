import React from 'react';
import { createRootRoute, Outlet, HeadContent } from '@tanstack/react-router';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
      { title: 'CinePulse - Premium TMDB Movie & TV List Manager' },
      { name: 'description', content: 'Discover trending movies and TV series, manage watchlists, favorites, and track where to stream titles.' },
      { name: 'keywords', content: 'movies, tv series, tmdb, watchlist, streaming, cinema, cinepulse, netflix, prime video' },
      { name: 'theme-color', content: '#0B0D19' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'CinePulse' },
      { property: 'og:title', content: 'CinePulse - Premium TMDB Movie & TV List Manager' },
      { property: 'og:description', content: 'Discover trending movies and TV series, manage watchlists, favorites, and track where to stream titles.' },
      { property: 'og:image', content: '/favicon.svg' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'CinePulse - Premium TMDB Movie & TV List Manager' },
      { name: 'twitter:description', content: 'Discover trending movies and TV series, manage watchlists, favorites, and track where to stream titles.' },
      { name: 'twitter:image', content: '/favicon.svg' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'apple-touch-icon', href: '/favicon.svg' },
      { rel: 'canonical', href: 'https://cinepulse.app' },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Outlet />
      </div>
    </>
  );
}
