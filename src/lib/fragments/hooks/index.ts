/**
 * Custom hooks for KaleidoManager
 *
 * These hooks manage the complex state and behaviors of the tab manager:
 * - useTabManagement: Tab CRUD operations and state
 * - useLayoutSelection: Layout selection flow and parameter collection
 * - useDashSync: Synchronization with Dash callbacks
 * - useKeyboardShortcuts: Global keyboard shortcut handling
 * - useShareLinks: URL-based tab sharing
 */

// Re-export all hooks
export { useTabManagement } from './useTabManagement';
export { useLayoutSelection } from './useLayoutSelection';
export { useDashSync } from './useDashSync';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';
export { useShareLinks } from './useShareLinks';

// Re-export types
export type {
  // Tab Management
  UseTabManagementOptions,
  UseTabManagementReturn,
  // Layout Selection
  UseLayoutSelectionOptions,
  UseLayoutSelectionReturn,
  LayoutSelectionState,
  LayoutDisplayInfo,
  LoadingLayoutInfo,
  LayoutWithId,
  ParameterOption,
  // Dash Sync
  UseDashSyncOptions,
  UseDashSyncReturn,
  // Keyboard Shortcuts
  UseKeyboardShortcutsOptions,
  // Share Links
  UseShareLinksOptions,
  UseShareLinksReturn,
  ShareData,
} from './types';
