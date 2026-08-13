import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: () => null, // Managed by main App component state/router
});
