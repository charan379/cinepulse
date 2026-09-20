import React, { useState } from 'react';
import { TMDBAccount } from '@/lib/tmdb';
import { UserProfileBadge } from '@/modules/auth/components/UserProfileBadge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MobileNavDrawer } from '@/components/MobileNavDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Home, ListOrdered, Sparkles, LogIn, Menu } from 'lucide-react';

interface NavigationProps {
  currentTab: 'home' | 'lists' | 'discover';
  onTabChange: (tab: 'home' | 'lists' | 'discover') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenFilterDrawer: () => void;
  isAuthenticated: boolean;
  account: TMDBAccount | null;
  onLogin: () => void;
  onLogout: () => void;
  isFiltered?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onOpenFilterDrawer,
  isAuthenticated,
  account,
  onLogin,
  onLogout,
  isFiltered,
}) => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <>
      {/* Main Header Bar */}
      <header className="sticky top-0 z-40 w-full app-nav px-3 sm:px-6 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => onTabChange('home')}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
          >
            <img
              src="/icon.png"
              alt="CinePulse Logo"
              className="h-8 w-8 rounded-lg object-cover border border-border"
            />
            <span className="text-base font-bold tracking-tight text-foreground">
              <span className="text-primary font-black">Cine</span>Pulse
            </span>
          </div>

          {/* Desktop Search Input */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search movies, series, cast..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Desktop Nav Controls */}
          <nav className="hidden md:inline-flex items-center gap-1 bg-muted p-0.5 rounded border border-border">
            <button
              onClick={() => onTabChange('home')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="h-3.5 w-3.5" /> Home
            </button>

            {isAuthenticated && (
              <button
                onClick={() => onTabChange('lists')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'lists'
                    ? 'bg-card text-foreground shadow-xs border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ListOrdered className="h-3.5 w-3.5" /> My Lists
              </button>
            )}

            <button
              onClick={() => onTabChange('discover')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                currentTab === 'discover'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Catalog
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <ThemeToggle />

            <Button
              variant={isFiltered ? 'default' : 'outline'}
              size="sm"
              onClick={onOpenFilterDrawer}
              className="relative text-xs h-8 px-2.5"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
              {isFiltered && (
                <span className="h-2 w-2 rounded-full bg-current ml-1 opacity-90" />
              )}
            </Button>

            {isAuthenticated && account ? (
              <UserProfileBadge account={account} onLogout={onLogout} onNavigateToTab={() => onTabChange('lists')} />
            ) : (
              <Button variant="default" size="sm" onClick={onLogin} className="text-xs h-8 px-3">
                <LogIn className="h-3.5 w-3.5" /> Login
              </Button>
            )}
          </div>

          {/* Mobile Header Menu Hamburger Trigger */}
          <div className="flex sm:hidden items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="h-8 w-8 rounded border-border bg-card cursor-pointer"
              title="Open Navigation Menu"
            >
              <Menu className="h-4 w-4 text-foreground" />
            </Button>
          </div>
        </div>

        {/* Mobile Inline Search Bar */}
        <div className="mt-2 block md:hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search titles, cast..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-xs bg-muted/50 border-border"
            />
          </div>
        </div>
      </header>

      {/* Mobile Sliding Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentTab={currentTab}
        onTabChange={onTabChange}
        onOpenFilterDrawer={onOpenFilterDrawer}
        isAuthenticated={isAuthenticated}
        account={account}
        onLogin={onLogin}
        onLogout={onLogout}
        isFiltered={isFiltered}
      />

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-card p-1 pb-safe border-t border-border shadow-xs">
        <div className="flex items-center justify-around">
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded text-[10px] font-medium transition-colors cursor-pointer ${
              currentTab === 'home'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => onTabChange('lists')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                currentTab === 'lists'
                  ? 'text-primary font-bold bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListOrdered className="h-4 w-4" />
              <span>Lists</span>
            </button>
          )}

          <button
            onClick={() => onTabChange('discover')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded text-[10px] font-medium transition-colors cursor-pointer ${
              currentTab === 'discover'
                ? 'text-primary font-bold bg-primary/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Catalog</span>
          </button>

          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </button>
        </div>
      </div>
    </>
  );
};
