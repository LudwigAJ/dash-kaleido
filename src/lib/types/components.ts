/**
 * Component Prop Type Definitions
 *
 * TypeScript interfaces for all component props.
 */

import type * as React from 'react';
import type { DashComponentProps, PersistenceProps, DashId } from './dash';
import type {
  Tab,
  RegisteredLayouts,
  SearchBarConfig,
  Theme,
  Size,
} from './index';

// =============================================================================
// KaleidoManager Props
// =============================================================================

/**
 * Props for the KaleidoManager component
 */
export interface KaleidoManagerProps
  extends DashComponentProps,
    PersistenceProps {
  /** Component ID (required) */
  id: DashId;
  /** CSS styles to apply to the component */
  style?: React.CSSProperties;
  /** Currently active tab ID */
  activeTab?: string;
  /** Data for the currently active tab */
  activeTabData?: Tab | null;
  /** Array of all tabs */
  tabs?: Tab[];
  /** Dictionary of registered layouts with metadata */
  registeredLayouts?: RegisteredLayouts;
  /** Subset of layouts to display (null = all) */
  displayedLayouts?: string[] | null;
  /** ID of the initial tab to create/select */
  initialTab?: string | null;
  /** Light or dark theme */
  theme?: Theme;
  /** Component size (sm, md, lg) */
  size?: Size;
  /** Maximum number of tabs allowed */
  maxTabs?: number;
  /** Overflow behavior for tab content */
  contentOverflow?: 'auto' | 'scroll' | 'hidden' | 'visible';
  /** Search bar configuration */
  searchBarConfig?: SearchBarConfig;
  /** Whether to show the status bar */
  enableStatusBar?: boolean;
  /** Tab content components */
  children?: React.ReactNode;
  /**
   * Data for all tabs with layouts (used for server-side rendering).
   * This is an output prop that triggers the rendering callback.
   */
  tabsData?: Tab[];
}

// =============================================================================
// KaleidoTab Props
// =============================================================================

/**
 * Props for the KaleidoTab component
 */
export interface KaleidoTabProps extends DashComponentProps {
  /** Component ID (required) */
  id: DashId;
  /** Tab content */
  children?: React.ReactNode;
  /** CSS styles to apply */
  style?: React.CSSProperties;
  /** CSS class name */
  className?: string;
}

// =============================================================================
// DashKaleido Props (Example Component)
// =============================================================================

/**
 * Props for the DashKaleido example component
 */
export interface DashKaleidoProps extends DashComponentProps {
  /** Component ID */
  id?: string;
  /** Label text to display */
  label: string;
  /** Input value */
  value?: string;
}

// =============================================================================
// Internal Component Props
// =============================================================================

/**
 * Props for the SortableTab component
 */
export interface SortableTabProps {
  /** Tab data */
  tab: Tab;
  /** Whether this tab is currently active */
  isActive: boolean;
  /** Callback when tab is clicked */
  onTabClick: (tabId: string) => void;
  /** Callback when close button is clicked */
  onCloseTab: (tabId: string) => void;
  /** Callback to start editing tab name */
  onStartEdit: (tabId: string, name: string) => void;
  /** Whether this tab is currently being edited */
  isEditing: boolean;
  /** Current edit value */
  editValue: string;
  /** Callback when edit value changes */
  onEditChange: (value: string) => void;
  /** Callback when editing is complete */
  onEditComplete: () => void;
  /** Callback when edit is cancelled */
  onEditCancel: () => void;
  /** Callback to show context menu */
  onContextMenu: (tabId: string, x: number, y: number) => void;
  /** Whether the tab is being dragged */
  isDragging?: boolean;
  /** Theme setting */
  theme?: Theme;
  /** Size setting */
  size?: Size;
}

/**
 * Props for the TabOverlay component
 */
export interface TabOverlayProps {
  /** Tab being dragged */
  tab: Tab | null;
  /** Theme setting */
  theme?: Theme;
  /** Size setting */
  size?: Size;
}

/**
 * Props for the SearchBar component
 */
export interface SearchBarProps {
  /** Available layouts to display */
  registeredLayouts: RegisteredLayouts;
  /** Currently selected layout ID */
  selectedLayoutId: string | null;
  /** Callback when layout is selected */
  onSelectLayout: (layoutId: string, params?: Record<string, string>) => void;
  /** Whether the search bar is open */
  isOpen: boolean;
  /** Callback to set open state */
  onOpenChange: (open: boolean) => void;
  /** Search bar configuration */
  config?: SearchBarConfig;
  /** Theme setting */
  theme?: Theme;
  /** Size setting */
  size?: Size;
}

/**
 * Props for the NotificationArea component
 */
export interface NotificationAreaProps {
  /** Array of notifications to display */
  notifications: Array<{
    id: number;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
  }>;
  /** Callback to dismiss a notification */
  onDismiss: (id: number) => void;
}

/**
 * Props for the LayoutCard component
 */
export interface LayoutCardProps {
  /** Layout ID */
  layoutId: string;
  /** Layout metadata */
  metadata: {
    name: string;
    description?: string;
    keywords?: string[];
  };
  /** Whether this layout is currently selected */
  isSelected: boolean;
  /** Callback when layout is clicked */
  onClick: () => void;
  /** Theme setting */
  theme?: Theme;
  /** Size setting */
  size?: Size;
}

/**
 * Props for modal components
 */
export interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * Props for the HelpModal component
 */
export interface HelpModalProps extends ModalProps {
  /** Theme setting */
  theme?: Theme;
}

/**
 * Props for the InfoModal component
 */
export interface InfoModalProps extends ModalProps {
  /** Tab to show info for */
  tab: Tab | null;
  /** Theme setting */
  theme?: Theme;
}
