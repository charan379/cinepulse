import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'CinePulse - Trending Movies & TV Series' },
      { name: 'description', content: 'Browse top trending movies, TV shows, upcoming releases, and OTT streaming providers on CinePulse.' },
      { property: 'og:title', content: 'CinePulse - Trending Movies & TV Series' },
      { property: 'og:description', content: 'Browse top trending movies, TV shows, upcoming releases, and OTT streaming providers on CinePulse.' },
    ],
  }),
  component: () => null,
});
