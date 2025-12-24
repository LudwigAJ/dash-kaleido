/**
 * Fragment Components for Dash Kaleido
 *
 * These are the internal fragment components used by the main components.
 * They handle specific parts of the UI:
 *
 * - DashKaleido: Example/demo component
 * - KaleidoManager: Main tab/layout manager component
 * - KaleidoTab: Tab content container
 * - SearchBar: Search bar with dropdown (formerly KaleidoSearchBar)
 * - InfoModal: Tab information modal
 * - HelpModal: Help documentation modal
 * - NotificationArea: Toast notifications
 * - TabOverlay: Drag overlay for tabs
 * - SortableTab: Sortable tab with DnD Kit
 */

// Main components
export { default as DashKaleido } from './DashKaleido';
export { default as KaleidoManager } from './KaleidoManager/KaleidoManager';
export { default as KaleidoTab } from './KaleidoTab';
export { default as SearchBar } from './KaleidoManager/SearchBar';
// Alias for backwards compatibility
export { default as KaleidoSearchBar } from './KaleidoManager/SearchBar';

// Modals
export { HelpModal, InfoModal, KaleidoModal, KaleidoModalRow, KaleidoModalSection, KaleidoModalKeyboardShortcut } from './modals';

// KaleidoManager sub-components (from KaleidoManager folder)
export { NotificationArea, TabOverlay, SortableTab } from './KaleidoManager';
export {
  TabBar,
  StatusBar,
  NewTabContent,
  LayoutCard,
} from './KaleidoManager';

// Context
export { KaleidoContext, KaleidoProvider, useKaleido } from './KaleidoManager/context';

// Re-export types
export type { DashKaleidoProps } from './DashKaleido';
export type { KaleidoManagerProps, SearchBarConfig } from './KaleidoManager/KaleidoManager';
export type { KaleidoTabProps } from './KaleidoTab';
export type { KaleidoSearchBarProps, SearchBarMode } from './KaleidoManager/SearchBar';
export type { InfoModalProps, HelpModalProps, KaleidoModalProps, KaleidoModalRowProps, KaleidoModalSectionProps, KaleidoModalKeyboardShortcutProps } from './modals';
export type { NotificationAreaProps } from './KaleidoManager/NotificationArea';
export type { TabOverlayProps } from './KaleidoManager/TabOverlay';
export type { SortableTabProps, ContextMenuAction } from './KaleidoManager/SortableTab';
export type { KaleidoContextValue, KaleidoTheme, KaleidoSize, KaleidoProviderProps } from './KaleidoManager/context';
export type {
  TabBarProps,
  StatusBarProps,
  StatusBarMode as StatusBarModeType,
  NewTabContentProps,
  LayoutCardProps,
  LayoutWithIdProps,
} from './KaleidoManager';
