import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw, RotateCcw, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingPlaceholderProps {
  message?: string;
  className?: string;
  minHeight?: string;
}

export const LoadingPlaceholder: React.FC<LoadingPlaceholderProps> = ({
  message = 'Loading data...',
  className,
  minHeight = 'min-h-[180px]',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-8 border border-border bg-card text-card-foreground rounded',
        minHeight,
        className
      )}
    >
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {message}
      </span>
    </div>
  );
};

export interface ErrorPlaceholderProps {
  title?: string;
  error?: Error | unknown;
  onRetry?: () => void;
  className?: string;
}

export const ErrorPlaceholder: React.FC<ErrorPlaceholderProps> = ({
  title = 'Failed to load content',
  error,
  onRetry,
  className,
}) => {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'An unexpected error occurred while fetching information.';

  return (
    <div
      className={cn(
        'rounded border border-destructive/30 border-l-4 border-l-destructive bg-destructive/5 p-4 text-card-foreground my-2',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-bold text-destructive">{title}</h4>
          <p className="text-xs text-muted-foreground">{errorMessage}</p>
          {onRetry && (
            <div className="pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={onRetry}
                className="h-7 px-3 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface EmptyPlaceholderProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onReload?: () => void;
  actionText?: string;
  className?: string;
}

export const EmptyPlaceholder: React.FC<EmptyPlaceholderProps> = ({
  title = 'No items found',
  description = 'There is currently no data available to display.',
  icon,
  onReload,
  actionText = 'Reload',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center border border-dashed border-border bg-card rounded my-2 space-y-3',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-muted-foreground">
        {icon || <Inbox className="h-5 w-5" />}
      </div>
      <div className="space-y-1 max-w-sm">
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {onReload && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReload}
          className="h-7 px-3 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 mt-1"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{actionText}</span>
        </Button>
      )}
    </div>
  );
};

export interface QueryPlaceholderProps {
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | unknown;
  isEmpty?: boolean;
  onRetry?: () => void;
  onReload?: () => void;
  actionText?: string;
  loadingText?: string;
  errorTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const QueryPlaceholder: React.FC<QueryPlaceholderProps> = ({
  isLoading,
  isError,
  error,
  isEmpty,
  onRetry,
  onReload,
  actionText,
  loadingText,
  errorTitle,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  children,
  className,
}) => {
  if (isLoading) {
    return <LoadingPlaceholder message={loadingText} className={className} />;
  }

  if (isError) {
    return (
      <ErrorPlaceholder
        title={errorTitle}
        error={error}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  if (isEmpty) {
    return (
      <EmptyPlaceholder
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        onReload={onReload}
        actionText={actionText}
        className={className}
      />
    );
  }

  return <>{children}</>;
};
