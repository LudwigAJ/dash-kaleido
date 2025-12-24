import React, { useState, useEffect } from 'react';
import { LockClosedIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui';
import type { Tab, LayoutMetadata, Notification } from '@/types';

export interface StatusBarMode {
  name: string;
  description?: string;
}

export interface StatusBarProps {
  enabled?: boolean;
  tabs: Tab[];
  activeTab: Tab | null;
  registeredLayouts?: Record<string, LayoutMetadata>;
  maxTabs?: number;
  lastSyncTime?: number;
  currentMode?: StatusBarMode | null;
  searchInputRef?: React.RefObject<HTMLInputElement>;
  notifications?: Notification[];
  setNotifications?: React.Dispatch<React.SetStateAction<Notification[]>>;
  showNotificationHistory?: boolean;
  setShowNotificationHistory?: (show: boolean) => void;
}

/**
 * StatusBar - Optional status bar at the bottom of KaleidoManager
 *
 * Displays:
 * - Current mode (Search, Display, Param, Options)
 * - Current layout name
 * - Active tab info with popover
 * - Tab count
 * - Notification bell with history
 * - Last sync time
 */
const StatusBar: React.FC<StatusBarProps> = ({
  enabled = false,
  tabs,
  activeTab,
  registeredLayouts = {},
  maxTabs = -1,
  lastSyncTime = Date.now(),
  currentMode,
  searchInputRef,
  notifications = [],
  setNotifications,
  showNotificationHistory = false,
  setShowNotificationHistory,
}) => {
  const [syncTimeDisplay, setSyncTimeDisplay] = useState('just now');

  // Update sync time display every 5 seconds
  useEffect(() => {
    if (!enabled) return;

    const updateSyncDisplay = () => {
      const elapsed = Date.now() - lastSyncTime;
      if (elapsed < 10000) {
        setSyncTimeDisplay('just now');
      } else if (elapsed < 60000) {
        setSyncTimeDisplay(`${Math.floor(elapsed / 1000)}s ago`);
      } else if (elapsed < 3600000) {
        setSyncTimeDisplay(`${Math.floor(elapsed / 60000)}m ago`);
      } else {
        setSyncTimeDisplay(`${Math.floor(elapsed / 3600000)}h ago`);
      }
    };

    updateSyncDisplay();
    const interval = setInterval(updateSyncDisplay, 5000);
    return () => clearInterval(interval);
  }, [enabled, lastSyncTime]);

  if (!enabled) return null;

  const layoutName = activeTab?.layoutId
    ? registeredLayouts?.[activeTab.layoutId]?.name || activeTab.layoutId
    : '--';
  const tabCount = tabs.length;

  const formatFullDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div
      className={[
        'kaleido-status-bar',
        'flex items-center gap-2 px-3 py-1.5',
        'bg-surface border-t border-border',
        'text-xs text-secondary',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Mode indicator */}
      <div className={['flex items-center gap-1 cursor-default'].filter(Boolean).join(' ')}>
        Mode: <span className="text-foreground">{currentMode?.name || '--'}</span>
      </div>

      <span className="text-border mx-0.5 opacity-60">|</span>

      {/* Layout indicator */}
      <div
        className={[
          'flex items-center gap-1',
          // Only show clickable style if there's a layout (not in New Tab)
          activeTab?.layoutId
            ? 'cursor-pointer rounded-sm px-1.5 py-0.5 hover:bg-surface-dim transition-colors'
            : 'cursor-default',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={(e) => {
          e.stopPropagation();
          // Only focus search if there's a layout (not New Tab)
          if (activeTab?.layoutId && searchInputRef?.current) {
            searchInputRef.current.focus();
          }
        }}
      >
        <MagnifyingGlassIcon className="w-3 h-3" />
        Layout: <span className="text-foreground">{layoutName}</span>
      </div>

      <span className="text-border mx-0.5 opacity-60">|</span>

      {/* Tab Info with shadcn/ui Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={[
              'flex items-center gap-1 cursor-pointer',
              'rounded-sm px-1.5 py-0.5',
              'hover:bg-surface-dim transition-colors',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            Tab: <span className="text-foreground">{activeTab?.name || '--'}</span>
            {activeTab?.locked && <LockClosedIcon className="w-3 h-3 text-secondary" />}
          </div>
        </PopoverTrigger>
        {activeTab && (
          <PopoverContent
            className="w-auto min-w-40 p-2 rounded-b-none"
            side="top"
            sideOffset={0}
            align="start"
          >
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-secondary">Name:</span>
                <span className="text-foreground">{activeTab.name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-secondary">ID:</span>
                <span className="text-foreground font-mono" style={{ fontSize: '10px' }}>
                  {activeTab.id}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-secondary">Created:</span>
                <span className="text-foreground">{formatFullDate(activeTab.createdAt)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-secondary">Layout:</span>
                <span className="text-foreground">{activeTab.layoutId || 'None'}</span>
              </div>
              <div className="flex justify-between gap-3 items-center">
                <span className="text-secondary">Locked:</span>
                <span className="flex items-center gap-1 text-foreground">
                  {activeTab.locked ? (
                    <>
                      <LockClosedIcon className="w-2.5 h-2.5" /> Yes
                    </>
                  ) : (
                    'No'
                  )}
                </span>
              </div>
              {(activeTab.layoutParams || activeTab.layoutParamOptionKey) && (
                <div className="flex justify-between gap-3">
                  <span className="text-secondary">Params:</span>
                  <span className="text-foreground" style={{ fontSize: '10px' }}>
                    {activeTab.layoutParamOptionKey || JSON.stringify(activeTab.layoutParams)}
                  </span>
                </div>
              )}
            </div>
          </PopoverContent>
        )}
      </Popover>

      <span className="text-border">|</span>

      {/* Tab count */}
      <div className="flex items-center gap-1 cursor-default">
        <span className="text-foreground">{maxTabs > 0 ? `${tabCount}/${maxTabs}` : tabCount}</span>
        {tabCount === 1 ? 'tab' : 'tabs'}
      </div>

      <div className="flex-1" />

      {/* Last updated indicator */}
      <div className="flex items-center gap-1 cursor-default text-secondary">
        Updated: <span className="text-foreground">{syncTimeDisplay}</span>
      </div>
    </div>
  );
};

export default React.memo(StatusBar);
