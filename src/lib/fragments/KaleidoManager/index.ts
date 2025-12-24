/**
 * KaleidoManager Module
 *
 * Main module for the KaleidoManager component and its sub-components.
 */

// Main KaleidoManager component
export { default as KaleidoManager } from './KaleidoManager';
export type { KaleidoManagerProps, SearchBarConfig } from './KaleidoManager';

// KaleidoManager sub-components (now in this folder)
export { default as NotificationArea } from './NotificationArea';
export { default as TabOverlay } from './TabOverlay';
export { default as SortableTab } from './SortableTab';
export { default as SearchBar } from './SearchBar';

// Components subfolder
export { TabBar, StatusBar, NewTabContent, LayoutCard } from './components';

// Context
export { KaleidoContext, KaleidoProvider, useKaleido } from './context';

// Re-export types
export type { NotificationAreaProps } from './NotificationArea';
export type { TabOverlayProps } from './TabOverlay';
export type { SortableTabProps, ContextMenuAction } from './SortableTab';
export type { KaleidoSearchBarProps, SearchBarMode } from './SearchBar';
export type {
  TabBarProps,
  StatusBarProps,
  StatusBarMode,
  NewTabContentProps,
  LayoutCardProps,
  LayoutWithIdProps,
} from './components';
export type {
  KaleidoContextValue,
  KaleidoTheme,
  KaleidoSize,
  KaleidoProviderProps,
} from './context';
