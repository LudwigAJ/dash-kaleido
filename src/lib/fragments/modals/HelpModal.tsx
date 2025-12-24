import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@/components/ui';
import { cn } from '@/utils/cn';
import { VERSION } from '../../version';
import { useKaleido } from '../KaleidoManager/context';

export interface HelpModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Version string to display */
  version?: string;
}

/**
 * HelpModal - Displays keyboard shortcuts and help information
 *
 * Uses shadcn/ui Dialog for accessible modal behavior.
 * Shows version info, keyboard shortcuts, and tab management tips.
 */
const HelpModal: React.FC<HelpModalProps> = ({ open, onOpenChange, version = VERSION }) => {
  const { theme } = useKaleido();
  const kbdClass = cn(
    'inline-flex items-center justify-center',
    'px-2 py-1 min-w-[1.5rem] h-6',
    'bg-surface-dim border border-border rounded-md',
    'text-xs font-mono font-medium text-foreground',
    'shadow-sm'
  );

  const shortcutRowClass = cn(
    'flex items-center justify-between gap-4',
    'py-2.5 border-b border-border/50 last:border-0'
  );

  const sectionTitleClass = cn(
    'text-xs font-semibold uppercase tracking-wider text-secondary',
    'mt-6 mb-3'
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" theme={theme}>
        <DialogHeader>
          <DialogTitle>Dash Kaleido</DialogTitle>
          <DialogDescription>Version {version}</DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <h4 className={sectionTitleClass}>Keyboard Shortcuts</h4>
          <div className="rounded-lg border border-border bg-surface p-3">
            <div className={shortcutRowClass}>
              <span className="text-sm text-foreground">New tab</span>
              <div className="flex items-center gap-1">
                <kbd className={kbdClass}>⌃</kbd>
                <kbd className={kbdClass}>N</kbd>
              </div>
            </div>
            <div className={shortcutRowClass}>
              <span className="text-sm text-foreground">Close tab</span>
              <div className="flex items-center gap-1">
                <kbd className={kbdClass}>⌃</kbd>
                <kbd className={kbdClass}>D</kbd>
              </div>
            </div>
            <div className={shortcutRowClass}>
              <span className="text-sm text-foreground">Lock / unlock tab</span>
              <div className="flex items-center gap-1">
                <kbd className={kbdClass}>⌃</kbd>
                <kbd className={kbdClass}>L</kbd>
              </div>
            </div>
            <div className={shortcutRowClass}>
              <span className="text-sm text-foreground">Rename tab</span>
              <div className="flex items-center gap-1">
                <kbd className={kbdClass}>⌃</kbd>
                <kbd className={kbdClass}>R</kbd>
              </div>
            </div>
            <div className={shortcutRowClass}>
              <span className="text-sm text-foreground">Tab info</span>
              <div className="flex items-center gap-1">
                <kbd className={kbdClass}>⌃</kbd>
                <kbd className={kbdClass}>I</kbd>
              </div>
            </div>
            <div className={shortcutRowClass}>
              <span className="text-sm text-foreground">Switch tabs</span>
              <div className="flex items-center gap-1">
                <kbd className={kbdClass}>⌃</kbd>
                <kbd className={kbdClass}>J</kbd>
                <span className="text-secondary text-xs">/</span>
                <kbd className={kbdClass}>K</kbd>
              </div>
            </div>
            <div className={shortcutRowClass}>
              <span className="text-sm text-foreground">Focus search</span>
              <div className="flex items-center gap-1">
                <kbd className={kbdClass}>Tab</kbd>
              </div>
            </div>
            <div className={shortcutRowClass}>
              <span className="text-sm text-foreground">Navigate results</span>
              <div className="flex items-center gap-1">
                <kbd className={kbdClass}>↑</kbd>
                <span className="text-secondary text-xs">/</span>
                <kbd className={kbdClass}>↓</kbd>
              </div>
            </div>
            <div className={shortcutRowClass}>
              <span className="text-sm text-foreground">Select layout</span>
              <div className="flex items-center gap-1">
                <kbd className={kbdClass}>Enter</kbd>
              </div>
            </div>
            <div className={cn(shortcutRowClass, 'border-b-0')}>
              <span className="text-sm text-foreground">Cancel</span>
              <div className="flex items-center gap-1">
                <kbd className={kbdClass}>Esc</kbd>
              </div>
            </div>
          </div>

          <h4 className={sectionTitleClass}>Tab Management</h4>
          <div className="rounded-lg border border-border bg-surface p-3 space-y-2">
            <p className="text-sm text-foreground">Right-click a tab for context menu</p>
            <p className="text-sm text-foreground">Locked tabs cannot be closed or renamed</p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Memoize to prevent unnecessary re-renders when parent state changes
export default React.memo(HelpModal);
