import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { tmdbService, TMDBList, TMDBMediaItem } from '@/lib/tmdb';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ListPlus, Check, Plus, Loader2, Sparkles, FolderCheck, AlertCircle } from 'lucide-react';

interface AddToListModalProps {
  mediaItem: TMDBMediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string | null;
  accountId?: number | null;
  lists: TMDBList[];
  onOpenCreateListModal?: () => void;
}

export const AddToListModal: React.FC<AddToListModalProps> = ({
  mediaItem,
  isOpen,
  onClose,
  sessionId,
  accountId,
  lists,
  onOpenCreateListModal,
}) => {
  const queryClient = useQueryClient();
  const [loadingListId, setLoadingListId] = useState<number | null>(null);
  const [overrideMap, setOverrideMap] = useState<Record<number, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaId = mediaItem?.id || 0;
  const mediaType: 'movie' | 'tv' =
    mediaItem?.media_type === 'movie'
      ? 'movie'
      : mediaItem?.media_type === 'tv'
      ? 'tv'
      : mediaItem?.first_air_date || (mediaItem?.name && !mediaItem?.title)
      ? 'tv'
      : 'movie';
  const title = mediaItem?.title || mediaItem?.name || 'Title';

  // Use TMDB v4 official /4/list/{list_id}/item_status API to check item presence in user's lists
  const { data: listStatusMap = {}, isLoading: isCheckingStatus } = useQuery<Record<number, boolean>>({
    queryKey: ['v4-check-item-in-lists', mediaId, mediaType, lists.map((l) => l.id).join(',')],
    queryFn: async () => {
      if (!mediaId || lists.length === 0) return {};
      const statusMap: Record<number, boolean> = {};

      await Promise.all(
        lists.map(async (list) => {
          try {
            const exists = await tmdbService.checkItemInList(list.id, mediaId, mediaType);
            statusMap[list.id] = exists;
          } catch (e) {
            statusMap[list.id] = false;
          }
        })
      );

      return statusMap;
    },
    enabled: isOpen && mediaId > 0 && lists.length > 0,
    staleTime: 0,
  });

  const handleToggleList = async (listId: number) => {
    if (!sessionId || !mediaId) return;
    const isCurrentlyInList = overrideMap[listId] !== undefined ? overrideMap[listId] : !!listStatusMap[listId];
    setLoadingListId(listId);
    setErrorMsg(null);

    // Optimistic UI update
    setOverrideMap((prev) => ({ ...prev, [listId]: !isCurrentlyInList }));

    try {
      if (isCurrentlyInList) {
        await tmdbService.removeListItem(sessionId, listId, mediaId, mediaType);
      } else {
        await tmdbService.addListItem(sessionId, listId, mediaId, mediaType);
      }
      queryClient.invalidateQueries({ queryKey: ['v4-check-item-in-lists', mediaId] });
      queryClient.invalidateQueries({ queryKey: ['list-detail', listId] });
      queryClient.invalidateQueries({ queryKey: ['user-lists', accountId, sessionId] });
    } catch (err: any) {
      console.error('Failed to update list item:', err);
      setOverrideMap((prev) => ({ ...prev, [listId]: isCurrentlyInList }));
      setErrorMsg(err.message || 'Could not update item in custom list.');
    } finally {
      setLoadingListId(null);
    }
  };

  if (!mediaItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-popover text-popover-foreground border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
              <FolderCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Add to Custom List</DialogTitle>
              <DialogDescription>Save "{title}" to your personal collections.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 my-2">
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl border border-destructive/40 bg-destructive/10 text-xs text-destructive font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isCheckingStatus && Object.keys(listStatusMap).length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">Checking list status via TMDB v4 API...</p>
            </div>
          ) : lists.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {lists.map((list) => {
                const isInList = overrideMap[list.id] !== undefined ? overrideMap[list.id] : !!listStatusMap[list.id];
                const isLoadingThis = loadingListId === list.id;

                return (
                  <div
                    key={list.id}
                    onClick={() => !isLoadingThis && handleToggleList(list.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isInList
                        ? 'border-primary/50 bg-primary/10 text-foreground'
                        : 'border-border bg-card hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold">{list.name}</h4>
                      <p className="text-[10px] text-muted-foreground">{list.item_count} items</p>
                    </div>

                    <Button
                      size="sm"
                      variant={isInList ? 'glow' : 'outline'}
                      disabled={isLoadingThis}
                      className="h-7 text-xs px-2.5 cursor-pointer"
                    >
                      {isLoadingThis ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isInList ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Added
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Plus className="h-3.5 w-3.5" /> Add
                        </span>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center space-y-3 rounded-xl border border-dashed border-border bg-muted/30 p-4">
              <Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-xs text-muted-foreground">You haven't created any custom lists yet.</p>
              {onOpenCreateListModal && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onOpenCreateListModal();
                  }}
                  className="text-xs h-8 cursor-pointer"
                >
                  <ListPlus className="h-3.5 w-3.5" /> Create First List
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
