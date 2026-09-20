import React from 'react';
import { TMDBAccount, getTMDBImageUrl } from '@/lib/tmdb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Heart, Bookmark, ListOrdered } from 'lucide-react';

interface UserProfileBadgeProps {
  account: TMDBAccount;
  onLogout: () => void;
  onNavigateToTab?: (tab: 'home' | 'lists' | 'discover', subTab?: 'custom' | 'watchlist' | 'favorites') => void;
}

export const UserProfileBadge: React.FC<UserProfileBadgeProps> = ({ account, onLogout, onNavigateToTab }) => {
  const avatarPath = account.avatar?.tmdb?.avatar_path;
  const avatarUrl = avatarPath ? getTMDBImageUrl(avatarPath, 'w185') : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative flex items-center gap-1.5 px-2 rounded bg-card border-border hover:bg-muted h-8">
          {avatarUrl ? (
            <img src={avatarUrl} alt={account.username} className="h-5 w-5 rounded object-cover border border-border" />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-[10px]">
              {account.username.substring(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-semibold text-foreground max-w-[80px] sm:max-w-[110px] truncate">{account.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex flex-col space-y-0.5">
          <span className="text-xs font-bold text-foreground">{account.name || account.username}</span>
          <span className="text-[10px] text-muted-foreground">@{account.username}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onNavigateToTab && (
          <>
            <DropdownMenuItem onClick={() => onNavigateToTab('lists', 'custom')} className="cursor-pointer">
              <ListOrdered className="h-3.5 w-3.5" />
              <span>Custom Lists</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigateToTab('lists', 'watchlist')} className="cursor-pointer">
              <Bookmark className="h-3.5 w-3.5 text-primary" />
              <span>My Watchlist</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigateToTab('lists', 'favorites')} className="cursor-pointer">
              <Heart className="h-3.5 w-3.5 text-destructive" />
              <span>My Favorites</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive cursor-pointer">
          <LogOut className="h-3.5 w-3.5" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
