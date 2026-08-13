import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/discover')({
  head: () => ({
    meta: [
      { title: 'Discover & Filter Titles - CinePulse' },
      { name: 'description', content: 'Search and filter movies and TV series by genre, cast, language, and regional PG ratings.' },
      { property: 'og:title', content: 'Discover & Filter Titles - CinePulse' },
      { property: 'og:description', content: 'Search and filter movies and TV series by genre, cast, language, and regional PG ratings.' },
    ],
  }),
  component: () => null,
});
