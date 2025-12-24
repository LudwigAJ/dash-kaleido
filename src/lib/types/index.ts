/**
 * Core Type Definitions for Dash Kaleido
 *
 * This file contains the fundamental types used throughout the application.
 */

// =============================================================================
// Tab Types
// =============================================================================

/**
 * Represents a tab in the KaleidoManager
 */
export interface Tab {
  /** Unique identifier for the tab */
  id: string;
  /** Display name for the tab */
  name: string;
  /** ID of the layout assigned to this tab, or null if no layout selected */
  layoutId: string | null;
  /** Unix timestamp when the tab was created */
  createdAt: number;
  /** Whether the tab is locked (cannot be closed/modified) */
  locked?: boolean;
  /** Whether the tab is pinned (stays at the beginning) */
  pinned?: boolean;
  /** Whether the tab is in a loading state */
  loading?: boolean;
  /** Parameters passed to the layout function */
  layoutParams?: Record<string, unknown>;
  /** Key for the selected parameter option (if using parameterOptions) */
  layoutParamOptionKey?: string;
}

// =============================================================================
// Layout Types
// =============================================================================

/**
 * Parameter information for a layout function
 */
export interface LayoutParameter {
  /** Parameter name */
  name: string;
  /** Whether the parameter has a default value */
  hasDefault: boolean;
  /** Default value (if any) */
  default?: unknown;
  /** Type annotation string (if any) */
  annotation?: string | null;
}

/**
 * Metadata for a registered layout
 */
export interface LayoutMetadata {
  /** Display name for the layout */
  name: string;
  /** Description of the layout */
  description?: string;
  /** Keywords for searching/filtering layouts */
  keywords?: string[];
  /** Whether multiple instances can be open simultaneously */
  allowMultiple?: boolean;
  /** Parameters accepted by the layout function */
  parameters?: LayoutParameter[];
  /** Pre-defined parameter configurations */
  parameterOptions?: Record<
    string,
    {
      description: string;
      params: Record<string, string>;
    }
  >;
}

/**
 * Dictionary of registered layouts by layout ID
 */
export type RegisteredLayouts = Record<string, LayoutMetadata>;

// =============================================================================
// Search Bar Types
// =============================================================================

/**
 * Configuration for the search bar
 */
export interface SearchBarConfig {
  /** Whether to show the search bar */
  show?: boolean;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Position of the search bar */
  position?: 'top' | 'under' | 'bottom';
  /** Whether to show layout dropdown in new tab content */
  showDropdownInNewTab?: boolean;
  /** Whether selecting a layout spawns a new tab */
  spawnLayoutInNewTab?: boolean;
  /** Subset of layouts to display (null = all) */
  displayedLayouts?: string[] | null;
}

// =============================================================================
// Notification Types
// =============================================================================

/**
 * Type of notification
 */
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

/**
 * A notification to display to the user
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: number;
  /** Type of notification (affects styling) */
  type: NotificationType;
  /** Message to display */
  message: string;
  /** Unix timestamp when the notification was created */
  timestamp: number;
}

// =============================================================================
// Loading State Types
// =============================================================================

/**
 * Dash loading state
 */
export interface LoadingState {
  /** Whether the component is currently loading */
  is_loading: boolean;
  /** Name of the prop that is loading */
  prop_name?: string;
  /** Name of the component that is loading */
  component_name?: string;
}

// =============================================================================
// Theme & Size Types
// =============================================================================

/**
 * Available themes for the KaleidoManager
 */
export type Theme = 'light' | 'dark';

/**
 * Available sizes for the KaleidoManager
 */
export type Size = 'sm' | 'md' | 'lg';

// =============================================================================
// Re-exports from other type modules
// =============================================================================

export type { SetProps, DashComponentProps, PersistenceProps } from './dash';
export type { KaleidoManagerProps, KaleidoTabProps, DashKaleidoProps } from './components';
