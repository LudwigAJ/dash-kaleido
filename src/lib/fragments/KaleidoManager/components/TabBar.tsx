import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PlusIcon, InfoCircledIcon } from '@radix-ui/react-icons';

import SortableTab from '../SortableTab';
import TabOverlay from '../TabOverlay';
import { Tooltip } from '@/components/ui';
import type { Tab, LayoutMetadata } from '@/types';
import type { ContextMenuAction } from '../SortableTab';

export interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  registeredLayouts: Record<string, LayoutMetadata>;
  canCloseTabs?: boolean;
  showContextMenu?: boolean;
  tabBarRef?: React.RefObject<HTMLDivElement>;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabRename?: (tabId: string, newName: string) => void;
  onTabLock?: (tabId: string, locked: boolean) => void;
  onTabPin?: (tabId: string, pinned: boolean) => void;
  onTabDuplicate?: (tabId: string) => void;
  onTabInfo?: (tab: Tab) => void;
  onTabsReorder: (tabs: Tab[]) => void;
  onNewTab: () => void;
  onShowHelp?: () => void;
  maxTabs?: number;
}

/**
 * TabBar - DnD-enabled tab bar for KaleidoManager
 *
 * Features:
 * - Sortable tabs with drag and drop
 * - Tab context menu (rename, lock, close, duplicate)
 * - New tab button
 * - Visual feedback during drag
 */
const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  registeredLayouts,
  canCloseTabs = true,
  showContextMenu = true,
  tabBarRef,
  onTabClick,
  onTabClose,
  onTabRename,
  onTabLock,
  onTabPin,
  onTabDuplicate,
  onTabInfo,
  onTabsReorder,
  onNewTab,
  onShowHelp,
  maxTabs = -1,
}) => {
  const [draggedTab, setDraggedTab] = useState<Tab | null>(null);

  // DnD Kit sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort tabs: pinned first, then by order
  const sortedTabs = useMemo(() => {
    return [...tabs].sort((a, b) => {
      // Pinned tabs first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [tabs]);

  // Extract tab IDs for SortableContext
  const tabIds = useMemo(() => sortedTabs.map((tab) => tab.id), [sortedTabs]);

  // DnD Kit handlers
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const tab = tabs.find((t) => t.id === event.active.id);
      if (tab) {
        setDraggedTab(tab);
      }
    },
    [tabs]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = tabs.findIndex((t) => t.id === active.id);
        const newIndex = tabs.findIndex((t) => t.id === over.id);
        const newTabs = arrayMove(tabs, oldIndex, newIndex);
        onTabsReorder?.(newTabs);
      }

      setDraggedTab(null);
    },
    [tabs, onTabsReorder]
  );

  const handleDragCancel = useCallback(() => {
    setDraggedTab(null);
  }, []);

  const canAddNewTab = maxTabs === -1 || tabs.length < maxTabs;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={tabIds} strategy={horizontalListSortingStrategy}>
        <div
          ref={tabBarRef}
          className={[
            'kaleido-tab-bar',
            'flex items-center flex-nowrap',
            'bg-surface select-none',
            'overflow-x-auto overflow-y-hidden shrink-0',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {sortedTabs.map((tab) => {
            const isLocked = tab.locked === true;
            const isLoading = tab.loading === true;

            return (
              <SortableTab
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTabId}
                isLocked={isLocked}
                isLoading={isLoading}
                onSelect={(tabId) => onTabClick(tabId)}
                onDoubleClick={(t) => !isLocked && onTabRename?.(t.id, t.name)}
                onClose={(tabId) => onTabClose(tabId)}
                onRename={(t) => onTabRename?.(t.id, t.name)}
                onInfo={(t) => onTabInfo?.(t)}
                onShare={() => {}}
                onLock={(t) => onTabLock?.(t.id, true)}
                onUnlock={(t) => onTabLock?.(t.id, false)}
              />
            );
          })}

          {/* Add Tab Button */}
          <Tooltip
            content={canAddNewTab ? 'Add new tab' : `Maximum ${maxTabs} tabs reached`}
            delayDuration={300}
          >
            <button
              className={[
                'inline-flex items-center justify-center',
                'p-1.5 mx-1 rounded-md border border-transparent',
                'text-secondary hover:text-foreground hover:bg-surface-dim',
                'transition-colors cursor-pointer',
                !canAddNewTab && 'opacity-40 cursor-not-allowed',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={onNewTab}
              disabled={!canAddNewTab}
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </Tooltip>

          {/* Flexible spacer - double-click to add tab */}
          {canAddNewTab ? (
            <Tooltip content="Double-click to add new tab" delayDuration={500}>
              <div
                className="flex-grow min-w-4"
                onDoubleClick={(e) => {
                  e.preventDefault();
                  onNewTab();
                }}
              />
            </Tooltip>
          ) : (
            <div className="flex-grow min-w-4" />
          )}

          {/* Help Button */}
          {onShowHelp && (
            <Tooltip content="Help (F1)" delayDuration={300}>
              <button
                className="inline-flex items-center justify-center p-1.5 mx-1 rounded-md text-secondary hover:text-foreground hover:bg-surface-dim transition-colors cursor-pointer"
                onClick={onShowHelp}
              >
                <InfoCircledIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
        </div>
      </SortableContext>

      {/* Drag overlay - shows the tab being dragged */}
      <DragOverlay>{draggedTab ? <TabOverlay tab={draggedTab} /> : null}</DragOverlay>
    </DndContext>
  );
};

export default React.memo(TabBar);
