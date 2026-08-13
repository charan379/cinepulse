import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TMDBAccount } from '@/lib/tmdb';
import { Film, Home, ListOrdered, Sparkles, Filter, LogIn, LogOut, User } from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: 'home' | 'lists' | 'discover';
  onTabChange: (tab: 'home' | 'lists' | 'discover') => void;
  onOpenFilterDrawer: () => void;
  isAuthenticated: boolean;
  account: TMDBAccount | null;
  onLogin: () => void;
  onLogout: () => void;
  isFiltered?: boolean;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onTabChange,
  onOpenFilterDrawer,
  isAuthenticated,
  account,
  onLogin,
  onLogout,
  isFiltered,
}) => {
  const handleNavClick = (tab: 'home' | 'lists' | 'discover') => {
    onTabChange(tab);
    onClose();
  };

  const handleFilterClick = () => {
    onClose();
    onOpenFilterDrawer();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full max-w-xs bg-popover text-popover-foreground border-border p-5 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header Branding */}
          <SheetHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 text-white shadow-md">
                <Film className="h-5 w-5" />
              </div>
              <div className="text-left">
                <SheetTitle className="text-base font-extrabold text-foreground">CinePulse</SheetTitle>
                <SheetDescription className="text-[11px]">Movie & TV List Manager</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* User Profile / Auth State */}
          <div className="rounded-xl border border-border bg-card p-3 space-y-2">
            {isAuthenticated && account ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">
                    {account.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground line-clamp-1">{account.name || account.username}</h4>
                    <p className="text-[10px] text-muted-foreground">@{account.username}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { onLogout(); onClose(); }} className="h-8 w-8 text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <p className="text-xs text-muted-foreground">Log in with TMDB to manage collections.</p>
                <Button variant="default" size="sm" onClick={() => { onLogin(); onClose(); }} className="w-full text-xs h-8 cursor-pointer">
                  <LogIn className="h-3.5 w-3.5" /> Login with TMDB
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Navigation</label>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('home')}
                className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'home'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Home className="h-4 w-4" /> Home
                </span>
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => handleNavClick('lists')}
                  className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    currentTab === 'lists'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ListOrdered className="h-4 w-4" /> My Lists & Collections
                  </span>
                </button>
              )}

              <button
                onClick={() => handleNavClick('discover')}
                className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'discover'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Discover Titles
                </span>
              </button>
            </nav>
          </div>

          {/* Quick Filter Action */}
          <div className="space-y-1.5 pt-2 border-t border-border">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Filters</label>
            <Button
              variant={isFiltered ? 'glow' : 'outline'}
              size="sm"
              onClick={handleFilterClick}
              className="w-full justify-between text-xs h-9 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" /> Advanced Filter Drawer
              </span>
              {isFiltered && (
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              )}
            </Button>
          </div>
        </div>

        {/* Bottom Theme Controls & Footer */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Appearance</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
};
