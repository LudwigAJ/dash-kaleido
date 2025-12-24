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

export interface KaleidoModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Modal title */
  title: string;
  /** Optional modal description */
  description?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Optional footer content */
  footer?: React.ReactNode;
  /** Maximum width class for the dialog */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Whether to show a close button in footer */
  showCloseButton?: boolean;
  /** Custom close button text */
  closeButtonText?: string;
}

/**
 * KaleidoModal - Base modal component for Kaleido modals
 *
 * A compound modal component that provides consistent styling and behavior
 * for all modal dialogs in the Kaleido application. Uses shadcn/ui Dialog
 * for accessible modal behavior.
 *
 * @example
 * <KaleidoModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="My Modal"
 *   description="Optional description"
 * >
 *   <div>Modal content here</div>
 * </KaleidoModal>
 */
const KaleidoModal: React.FC<KaleidoModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  showCloseButton = true,
  closeButtonText = 'Close',
}) => {
  const maxWidthClasses: Record<NonNullable<KaleidoModalProps['maxWidth']>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidthClasses[maxWidth]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="mt-4">{children}</div>

        {(footer || showCloseButton) && (
          <DialogFooter>
            {footer}
            {showCloseButton && (
              <Button variant="outline" onClick={handleClose}>
                {closeButtonText}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Sub-components for compound pattern
KaleidoModal.displayName = 'KaleidoModal';

export interface KaleidoModalRowProps {
  /** Row label */
  label: string;
  /** Row value content */
  children: React.ReactNode;
  /** Whether this is the last row (no bottom border) */
  isLast?: boolean;
}

/**
 * KaleidoModalRow - A styled row for displaying label-value pairs in modals
 */
export const KaleidoModalRow: React.FC<KaleidoModalRowProps> = ({
  label,
  children,
  isLast = false,
}) => {
  const rowClass = [
    'flex items-center justify-between gap-4 py-2.5',
    isLast ? '' : 'border-b border-border/50',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rowClass}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{children}</span>
    </div>
  );
};

KaleidoModalRow.displayName = 'KaleidoModalRow';

export interface KaleidoModalSectionProps {
  /** Section title */
  title: string;
  /** Section content */
  children: React.ReactNode;
}

/**
 * KaleidoModalSection - A styled section with title for grouping content
 */
export const KaleidoModalSection: React.FC<KaleidoModalSectionProps> = ({ title, children }) => {
  return (
    <div className="mb-4 last:mb-0">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-3 first:mt-0">
        {title}
      </h4>
      <div className="rounded-lg border border-border bg-card p-3">{children}</div>
    </div>
  );
};

KaleidoModalSection.displayName = 'KaleidoModalSection';

export interface KaleidoModalKeyboardShortcutProps {
  /** Description of the shortcut */
  description: string;
  /** Array of key symbols/names */
  keys: string[];
  /** Whether this is the last row */
  isLast?: boolean;
}

/**
 * KaleidoModalKeyboardShortcut - A styled row for displaying keyboard shortcuts
 */
export const KaleidoModalKeyboardShortcut: React.FC<KaleidoModalKeyboardShortcutProps> = ({
  description,
  keys,
  isLast = false,
}) => {
  const rowClass = [
    'flex items-center justify-between gap-4 py-2.5',
    isLast ? '' : 'border-b border-border/50',
  ]
    .filter(Boolean)
    .join(' ');

  const kbdClass = [
    'inline-flex items-center justify-center',
    'px-2 py-1 min-w-[1.5rem] h-6',
    'bg-muted border border-border rounded-md',
    'text-xs font-mono font-medium text-foreground',
    'shadow-sm',
  ].join(' ');

  return (
    <div className={rowClass}>
      <span className="text-sm text-foreground">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <kbd key={index} className={kbdClass}>
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
};

KaleidoModalKeyboardShortcut.displayName = 'KaleidoModalKeyboardShortcut';

export default KaleidoModal;
