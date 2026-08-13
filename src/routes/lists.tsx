import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/lists')({
  head: () => ({
    meta: [
      { title: 'My Custom Lists & Collections - CinePulse' },
      { name: 'description', content: 'Manage your custom TMDB movie and TV show lists, watchlist, favorites, and seen history.' },
      { property: 'og:title', content: 'My Custom Lists & Collections - CinePulse' },
      { property: 'og:description', content: 'Manage your custom TMDB movie and TV show lists, watchlist, favorites, and seen history.' },
    ],
  }),
  component: () => null,
});
