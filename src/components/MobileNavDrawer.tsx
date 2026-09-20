import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { TMDBAccount } from '@/lib/tmdb';
import { Home, ListOrdered, Sparkles, Filter, LogIn, LogOut } from 'lucide-react';

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
      <SheetContent side="right" className="w-full max-w-xs bg-card text-card-foreground border-l border-border p-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header Branding */}
          <SheetHeader className="border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <img
                src="/icon.png"
                alt="CinePulse Logo"
                className="h-8 w-8 rounded object-cover border border-border"
              />
              <div className="text-left">
                <SheetTitle className="text-base font-bold tracking-tight text-foreground">
                  <span className="text-primary font-black">Cine</span>Pulse
                </SheetTitle>
                <SheetDescription className="text-[11px] text-muted-foreground">Catalog & List Manager</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* User Profile / Auth State */}
          <div className="rounded border border-border bg-muted/40 p-2.5 space-y-2">
            {isAuthenticated && account ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-xs">
                    {account.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground line-clamp-1">{account.name || account.username}</h4>
                    <p className="text-[10px] text-muted-foreground">@{account.username}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { onLogout(); onClose(); }} className="h-7 w-7 text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5 text-center">
                <p className="text-xs text-muted-foreground">Log in with TMDB to manage collections.</p>
                <Button variant="default" size="sm" onClick={() => { onLogin(); onClose(); }} className="w-full text-xs h-7 cursor-pointer">
                  <LogIn className="h-3.5 w-3.5 mr-1" /> Login with TMDB
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Navigation</label>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('home')}
                className={`flex items-center justify-between w-full p-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'home'
                    ? 'bg-primary text-primary-foreground'
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
                  className={`flex items-center justify-between w-full p-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    currentTab === 'lists'
                      ? 'bg-primary text-primary-foreground'
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
                className={`flex items-center justify-between w-full p-2 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  currentTab === 'discover'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Catalog Explorer
                </span>
              </button>
            </nav>
          </div>

          {/* Quick Filter Action */}
          <div className="space-y-1 pt-2 border-t border-border">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Filters</label>
            <Button
              variant={isFiltered ? 'default' : 'outline'}
              size="sm"
              onClick={handleFilterClick}
              className="w-full justify-between text-xs h-8 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" /> Filter Drawer
              </span>
              {isFiltered && (
                <span className="h-2 w-2 rounded-full bg-current opacity-90" />
              )}
            </Button>
          </div>
        </div>

        {/* Bottom Theme Controls & Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
};
