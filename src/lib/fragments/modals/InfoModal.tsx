import React from 'react';
import type { Tab } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from '@/components/ui';

export interface InfoModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Tab data to display */
  tab: Tab | null;
}

/**
 * InfoModal - Displays detailed information about a tab
 *
 * Uses shadcn/ui Dialog for accessible modal behavior.
 * Shows tab name, ID, creation date, layout, lock status, and parameters.
 */
const InfoModal: React.FC<InfoModalProps> = ({ open, onOpenChange, tab }) => {
  const rowClass = [
    'flex items-center justify-between gap-4 py-2.5',
    'border-b border-border/50 last:border-0',
  ].join(' ');

  const labelClass = 'text-sm text-muted-foreground';
  const valueClass = 'text-sm font-medium text-foreground';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tab Information</DialogTitle>
        </DialogHeader>
        {tab && (
          <div className="mt-4 rounded-lg border border-border bg-card p-4">
            <div className={rowClass}>
              <span className={labelClass}>Name</span>
              <span className={valueClass}>{tab.name}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>ID</span>
              <span className="text-xs font-mono text-muted-foreground">
                {tab.id}
              </span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Created</span>
              <span className={valueClass}>
                {new Date(tab.createdAt).toLocaleString()}
              </span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Layout</span>
              <span className={valueClass}>{tab.layoutId || 'None'}</span>
            </div>
            <div className={rowClass}>
              <span className={labelClass}>Locked</span>
              <span className={valueClass}>
                {tab.locked ? 'Yes' : 'No'}
              </span>
            </div>
            {(tab.layoutParams || tab.layoutParamOptionKey) && (
              <div className={rowClass}>
                <span className={labelClass}>Parameters</span>
                <span className={valueClass}>
                  {tab.layoutParamOptionKey ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {tab.layoutParamOptionKey}
                    </span>
                  ) : (
                    JSON.stringify(tab.layoutParams)
                  )}
                </span>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Memoize to prevent unnecessary re-renders when parent state changes
export default React.memo(InfoModal);
