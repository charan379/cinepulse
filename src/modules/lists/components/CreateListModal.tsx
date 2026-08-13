import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ListPlus, Sparkles } from 'lucide-react';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => Promise<any>;
  isLoading: boolean;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({ isOpen, onClose, onCreate, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('List name is required');
      return;
    }
    setError(null);
    try {
      await onCreate(name.trim(), description.trim());
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create list');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-popover text-popover-foreground border-border">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
              <ListPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Create New List</DialogTitle>
              <DialogDescription>Organize your favorite movies & TV series into custom collections.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {error && (
            <div className="rounded-xl bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">List Title *</label>
            <Input
              placeholder="e.g. 90s Sci-Fi Classics, Weekend Binge..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
            <Input
              placeholder="Brief summary of what this list is about..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={isLoading || !name.trim()} className="cursor-pointer">
              {isLoading ? <Sparkles className="h-4 w-4 animate-spin" /> : 'Create List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
