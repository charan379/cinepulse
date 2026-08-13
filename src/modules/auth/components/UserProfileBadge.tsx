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
import { LogOut, Heart, Bookmark, CheckCircle2 } from 'lucide-react';

interface UserProfileBadgeProps {
  account: TMDBAccount;
  onLogout: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const UserProfileBadge: React.FC<UserProfileBadgeProps> = ({ account, onLogout, onNavigateToTab }) => {
  const avatarPath = account.avatar?.tmdb?.avatar_path;
  const avatarUrl = avatarPath ? getTMDBImageUrl(avatarPath, 'w185') : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative flex items-center gap-1.5 p-1 pl-1.5 pr-2.5 rounded-full bg-card border-border hover:bg-muted h-8">
          {avatarUrl ? (
            <img src={avatarUrl} alt={account.username} className="h-6 w-6 rounded-full object-cover ring-1 ring-primary" />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[10px]">
              {account.username.substring(0, 2).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-semibold text-foreground max-w-[80px] sm:max-w-[110px] truncate">{account.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="flex flex-col space-y-0.5">
          <span className="text-xs font-bold text-foreground">{account.name || account.username}</span>
          <span className="text-[10px] text-muted-foreground">@{account.username}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onNavigateToTab && (
          <>
            <DropdownMenuItem onClick={() => onNavigateToTab('lists')} className="cursor-pointer">
              <Bookmark className="h-4 w-4 text-primary" />
              <span>My Watchlist</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigateToTab('lists')} className="cursor-pointer">
              <Heart className="h-4 w-4 text-primary" />
              <span>My Favorites</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigateToTab('lists')} className="cursor-pointer">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Seen / Watched</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive cursor-pointer">
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
