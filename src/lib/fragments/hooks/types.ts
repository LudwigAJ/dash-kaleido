/**
 * Type definitions for KaleidoManager hooks
 */

import type * as React from 'react';
import type {
  Tab,
  RegisteredLayouts,
  SearchBarConfig,
  Notification,
  LayoutMetadata,
} from '@/types';

// =============================================================================
// Layout Types for Hooks
// =============================================================================

/**
 * Layout with its ID attached (for display in lists)
 */
export interface LayoutWithId extends LayoutMetadata {
  id: string;
}

/**
 * Option for a layout parameter (from parameterOptions in LayoutMetadata)
 */
export interface ParameterOption {
  description: string;
  params: Record<string, string>;
}

// =============================================================================
// useTabManagement Types
// =============================================================================

export interface UseTabManagementOptions {
  /** UUID generator function */
  generateUUID: () => string;
  /** Maximum tabs allowed (-1 = no limit) */
  maxTabs?: number;
  /** Layout metadata */
  registeredLayouts?: RegisteredLayouts;
  /** Initial tabs from persistence */
  initialTabs?: Tab[] | null;
  /** Layout ID for default tab */
  initialTab?: string | null;
  /** Callback to reset layout selection state */
  onResetLayoutSelection?: () => void;
}

export interface UseTabManagementReturn {
  // State
  tabs: Tab[];
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  activeTabId: string | null;
  setActiveTabId: React.Dispatch<React.SetStateAction<string | null>>;
  activeTab: Tab | null;
  canAddTab: boolean;

  // Rename state
  editingTabId: string | null;
  editingTabName: string;
  renameInputRef: React.RefObject<HTMLInputElement>;

  // Tab operations
  addTab: () => Tab | null;
  removeTab: (tabId: string) => void;
  selectTab: (tabId: string) => void;
  renameTab: (tabId: string, newName: string) => void;
  lockTab: (tabId: string) => void;
  unlockTab: (tabId: string) => void;
  pinTab: (tabId: string, pinned: boolean) => void;
  duplicateTab: (tabId: string) => void;
  updateTabLayout: (
    tabId: string,
    layoutId: string,
    layoutName: string,
    layoutParams?: Record<string, string> | null,
    layoutParamOptionKey?: string | null
  ) => void;

  // Rename operations
  startRename: (tab: Tab) => void;
  finishRename: () => void;
  cancelRename: () => void;
  handleRenameInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRenameBlur: () => void;
}

// =============================================================================
// useLayoutSelection Types
// =============================================================================

export interface UseLayoutSelectionOptions {
  /** Layout metadata with parameters */
  registeredLayouts?: RegisteredLayouts;
  /** Layout IDs to show in New Tab */
  displayedLayouts?: string[] | null;
  /** Search bar configuration */
  searchBarConfig?: Partial<SearchBarConfig>;
  /** Current active tab ID (can be null initially) */
  activeTabId: string | null;
  /** Function to update tab's layout */
  updateTabLayout: (
    tabId: string,
    layoutId: string,
    layoutName: string,
    layoutParams?: Record<string, string> | null,
    layoutParamOptionKey?: string | null
  ) => void;
  /** Current tabs for checking disabled layouts */
  tabs?: Tab[];
}

export interface LayoutInfo {
  id: string;
  name: string;
  description?: string;
  keywords?: string[];
  parameters?: Array<{
    name: string;
    hasDefault: boolean;
    default?: unknown;
    annotation?: string | null;
  }>;
  allowMultiple?: boolean;
  parameterOptions?: Record<
    string,
    { description: string; params: Record<string, string> }
  >;
}

export interface LoadingLayoutInfo {
  layoutName: string;
  params: Record<string, string> | null;
  optionKey: string | null;
  pendingParams: Array<{
    name: string;
    hasDefault: boolean;
    default?: unknown;
  }>;
}

export interface LayoutDisplayInfo {
  type: 'option' | 'params' | 'simple';
  layoutName: string;
  optionKey?: string;
  params?: Record<string, string>;
  paramDefs?: Array<{
    name: string;
    hasDefault: boolean;
    default?: unknown;
  }>;
}

export interface LayoutSelectionState {
  searchQuery: string;
  showSearchDropdown: boolean;
  selectedLayoutIndex: number;
  isKeyboardNavigating: boolean;
  isEditingSearch: boolean;
  pendingLayout: string | null;
  pendingParams: Array<{
    name: string;
    hasDefault: boolean;
    default?: unknown;
  }>;
  currentParamIndex: number;
  parameterValues: Record<string, string>;
  paramInputValue: string;
  showingDefault: boolean;
  showParamOptionsDropdown: boolean;
  paramOptions: Record<
    string,
    { description: string; params: Record<string, string> }
  >;
  selectedParamOptionIndex: number;
  loadingLayoutInfo: LoadingLayoutInfo | null;
}

export interface UseLayoutSelectionReturn extends LayoutSelectionState {
  // State setters
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setShowSearchDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedLayoutIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsKeyboardNavigating: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditingSearch: React.Dispatch<React.SetStateAction<boolean>>;
  setParamInputValue: React.Dispatch<React.SetStateAction<string>>;
  setShowingDefault: React.Dispatch<React.SetStateAction<boolean>>;
  setShowParamOptionsDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedParamOptionIndex: React.Dispatch<React.SetStateAction<number>>;
  setLoadingLayoutInfo: React.Dispatch<
    React.SetStateAction<LoadingLayoutInfo | null>
  >;

  // Derived state
  isCollectingParams: boolean;
  paramOptionsJustOpened: React.MutableRefObject<boolean>;

  // Refs
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchDropdownRef: React.RefObject<HTMLDivElement>;
  paramOptionsDropdownRef: React.RefObject<HTMLDivElement>;

  // Layout helpers
  layoutRequiresParams: (layoutId: string) => boolean;
  getLayoutParams: (layoutId: string) => Array<{
    name: string;
    hasDefault: boolean;
    default?: unknown;
    annotation?: string | null;
  }>;
  getLayoutParamOptions: (
    layoutId: string
  ) => Record<
    string,
    { description: string; params: Record<string, string> }
  > | null;
  isLayoutDisabled: (layoutId: string) => boolean;
  getFilteredLayouts: () => LayoutInfo[];
  getDropdownLayouts: () => LayoutInfo[];
  getDisplayedLayouts: () => LayoutInfo[];
  getCurrentLayoutDisplayInfo: (tab: Tab | null) => LayoutDisplayInfo | null;
  clearLoadingInfo: () => void;

  // Actions
  selectLayout: (layoutId: string) => void;
  startParamCollection: (layoutId: string) => void;
  cancelParamCollection: () => void;
  advanceToNextParam: () => void;
  selectParamOption: (optionKey: string) => void;
  applyLayoutToTab: (
    layoutId: string,
    params?: Record<string, string>,
    optionKey?: string | null
  ) => void;
  resetLayoutSelection: () => void;

  // Per-tab state management
  saveStateToCache: (tabId: string) => void;
  restoreStateFromCache: (tabId: string) => void;
  clearCacheForTab: (tabId: string) => void;
  cleanupCache: (currentTabs: Tab[]) => void;
  getCurrentState: () => LayoutSelectionState;
  getPreviousTabId: () => string | null;
  setPreviousTabId: (tabId: string | null) => void;
}

// =============================================================================
// useDashSync Types
// =============================================================================

export interface UseDashSyncOptions {
  /** Internal tabs state */
  tabs: Tab[];
  /** Internal active tab ID */
  activeTabId: string | null;
  /** Tabs prop from Dash */
  controlledTabs?: Tab[];
  /** Active tab prop from Dash */
  controlledActiveTab?: string;
  /** Whether persistence is enabled */
  persistence?: boolean | string | number;
  /** Dash setProps function */
  setProps?: (props: Record<string, unknown>) => void;
  /** Set internal tabs state */
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  /** Set internal active tab ID */
  setActiveTabId: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface UseDashSyncReturn {
  /** Last sync timestamp */
  lastSyncTime: number;
  /** Mark that an internal update is happening */
  markInternalUpdate: () => void;
  /** Whether initial props have been received from Dash */
  hasReceivedInitialProps: boolean;
}

// =============================================================================
// useKeyboardShortcuts Types
// =============================================================================

export interface UseKeyboardShortcutsOptions {
  /** Current tabs array */
  tabs: Tab[];
  /** Current active tab ID */
  activeTabId: string | null;
  /** Add new tab function */
  addTab: () => Tab | null;
  /** Remove tab function */
  removeTab: (tabId: string) => void;
  /** Select tab function */
  selectTab: (tabId: string) => void;
  /** Lock tab function */
  lockTab: (tabId: string) => void;
  /** Unlock tab function */
  unlockTab: (tabId: string) => void;
  /** Start rename function */
  startRename: (tab: Tab) => void;
  /** Show info modal for a tab */
  showInfo: (tab: Tab) => void;
  /** Ref to search input */
  searchInputRef: React.RefObject<HTMLInputElement> | null;
  /** Whether search bar is visible */
  shouldShowSearchBar: boolean;
  /** Whether dropdown is visible */
  showSearchDropdown: boolean;
  /** Set help modal visibility */
  setShowHelpModal: React.Dispatch<React.SetStateAction<boolean>>;
  /** Whether shortcuts are enabled (default: true) */
  enabled?: boolean;
}

// =============================================================================
// useShareLinks Types
// =============================================================================

export interface ShareData {
  layoutId: string;
  name: string;
  layoutParams?: Record<string, string>;
  layoutParamOptionKey?: string;
}

export interface UseShareLinksOptions {
  /** Current tabs array */
  tabs: Tab[];
  /** Layout metadata */
  registeredLayouts?: RegisteredLayouts;
  /** Maximum tabs allowed (-1 = no limit) */
  maxTabs?: number;
  /** UUID generator function */
  generateUUID: () => string;
  /** Set tabs function */
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  /** Set active tab function */
  setActiveTabId: React.Dispatch<React.SetStateAction<string | null>>;
  /** Add notification function */
  addNotification?: (
    type: Notification['type'],
    message: string
  ) => void;
}

export interface UseShareLinksReturn {
  /** Generate share link for a tab */
  generateShareLink: (tab: Tab) => string | null;
  /** Copy share link to clipboard */
  shareTab: (tab: Tab | null) => void;
  /** Spawn a shared tab from decoded data */
  spawnSharedTab: (shareData: ShareData) => boolean;
  /** Process URL hash for shared tabs */
  processShareHash: () => void;
}
