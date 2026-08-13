import React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Outlet />
    </div>
  );
}
