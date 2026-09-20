import React from 'react';
import { createRootRoute, Outlet, HeadContent } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
      { title: 'CinePulse - Movie & TV Catalog Manager' },
      { name: 'description', content: 'Discover movies and TV series, organize custom collections, manage watchlists, favorites, and browse catalogs.' },
      { name: 'keywords', content: 'movies, tv series, tmdb, watchlist, streaming, cinema, cinepulse, catalog' },
      { name: 'theme-color', content: '#007bff' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'CinePulse' },
      { property: 'og:title', content: 'CinePulse - Movie & TV Catalog Manager' },
      { property: 'og:description', content: 'Discover movies and TV series, organize custom collections, manage watchlists, favorites, and browse catalogs.' },
      { property: 'og:image', content: '/icon.png' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'CinePulse - Movie & TV Catalog Manager' },
      { name: 'twitter:description', content: 'Discover movies and TV series, organize custom collections, manage watchlists, favorites, and browse catalogs.' },
      { name: 'twitter:image', content: '/icon.png' },
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
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
