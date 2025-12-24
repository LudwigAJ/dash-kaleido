import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LockClosedIcon, Cross2Icon, UpdateIcon } from '@radix-ui/react-icons';
import {
  Tooltip,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from '@/components/ui';
import type { Tab } from '@/types';

/** Actions available in the tab context menu */
export type ContextMenuAction = 'close' | 'rename' | 'lock' | 'pin' | 'duplicate';

export interface SortableTabProps {
  /** Tab data object containing id, name, layoutId, etc. */
  tab: Tab;
  /** Whether this tab is currently active */
  isActive?: boolean;
  /** Whether this tab is currently being renamed */
  isEditing?: boolean;
  /** Whether this tab is locked */
  isLocked?: boolean;
  /** Whether this tab is in a loading state */
  isLoading?: boolean;
  /** Current value of the rename input */
  editingTabName?: string;
  /** Ref for the rename input element */
  renameInputRef?: React.RefObject<HTMLInputElement>;
  /** Called when tab is clicked */
  onSelect: (tabId: string) => void;
  /** Called when tab is double-clicked */
  onDoubleClick: (tab: Tab) => void;
  /** Called when close button is clicked */
  onClose: (tabId: string) => void;
  /** Called when rename input changes */
  onRenameChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Called when rename input loses focus */
  onRenameBlur?: () => void;
  /** Called when key is pressed in rename input */
  onRenameKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Called when Rename menu item is selected */
  onRename: (tab: Tab) => void;
  /** Called when Info menu item is selected */
  onInfo: (tab: Tab) => void;
  /** Called when Share menu item is selected */
  onShare: (tab: Tab) => void;
  /** Called when Lock Tab menu item is selected */
  onLock: (tab: Tab) => void;
  /** Called when Unlock Tab menu item is selected */
  onUnlock: (tab: Tab) => void;
}

/**
 * SortableTab component using @dnd-kit/sortable with Radix ContextMenu
 * Enhanced with shadcn/ui-style Tailwind classes
 *
 * This component handles:
 * - Drag-and-drop via DnD Kit's useSortable hook
 * - Right-click context menu via Radix ContextMenu
 * - Inline tab renaming
 * - Tab lock/unlock state
 * - Close button with tooltip
 */
const SortableTab: React.FC<SortableTabProps> = ({
  tab,
  isActive = false,
  isEditing = false,
  isLocked = false,
  isLoading = false,
  editingTabName = '',
  renameInputRef,
  onSelect,
  onDoubleClick,
  onClose,
  onRenameChange,
  onRenameBlur,
  onRenameKeyDown,
  onRename,
  onInfo,
  onShare,
  onLock,
  onUnlock,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.id,
    disabled: isEditing || isLocked,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          className={[
            'relative inline-flex items-center gap-2 px-3 py-1.5',
            'border-r border-border',
            'bg-surface text-foreground text-xs',
            'cursor-pointer select-none transition-colors',
            'hover:bg-surface-dim',
            isActive && 'bg-background font-semibold',
            isDragging && 'opacity-40 shadow-lg z-50',
            isLocked && 'opacity-80',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => !isEditing && onSelect(tab.id)}
          onDoubleClick={() => !isLocked && onDoubleClick(tab)}
          title={tab.name}
          {...attributes}
          {...listeners}
        >
          {/* Tab name - always present for size stability */}
          <span
            className={['truncate max-w-32 flex items-center gap-1.5', isEditing && 'invisible']
              .filter(Boolean)
              .join(' ')}
          >
            {tab.name}
            {isLoading && <UpdateIcon className="w-3 h-3 animate-spin text-primary" />}
          </span>
          {/* Rename input - absolutely positioned over the tab name */}
          {isEditing && (
            <input
              ref={renameInputRef}
              type="text"
              className="kaleido-tab-rename-input"
              value={editingTabName}
              onChange={onRenameChange}
              onBlur={onRenameBlur}
              onKeyDown={onRenameKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {isLocked ? (
            <Tooltip content="Tab is locked" delayDuration={300}>
              <span className="text-secondary flex items-center">
                <LockClosedIcon className="w-3.5 h-3.5" />
              </span>
            </Tooltip>
          ) : (
            <Tooltip content="Close tab" delayDuration={300}>
              <button
                className={[
                  'text-secondary rounded-sm p-0.5',
                  'transition-colors flex items-center',
                  'hover:text-foreground hover:bg-destructive/20',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
              >
                <Cross2Icon className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-36">
        <ContextMenuItem disabled={isLocked} onSelect={() => onRename(tab)}>
          Rename
          <ContextMenuShortcut>^R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onInfo(tab)}>
          Info
          <ContextMenuShortcut>^I</ContextMenuShortcut>
        </ContextMenuItem>
        {tab.layoutId && <ContextMenuItem onSelect={() => onShare(tab)}>Share</ContextMenuItem>}
        {tab.layoutId && !isLocked && (
          <ContextMenuItem onSelect={() => onLock(tab)}>
            Lock Tab
            <ContextMenuShortcut>^L</ContextMenuShortcut>
          </ContextMenuItem>
        )}
        {isLocked && (
          <ContextMenuItem onSelect={() => onUnlock(tab)}>
            Unlock Tab
            <ContextMenuShortcut>^L</ContextMenuShortcut>
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive" disabled={isLocked} onSelect={() => onClose(tab.id)}>
          Close Tab
          <ContextMenuShortcut>^D</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

// Memoize to prevent unnecessary re-renders when parent state changes
// Tab only re-renders when its specific props change
export default React.memo(SortableTab);
