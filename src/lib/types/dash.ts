/**
 * Dash-Specific Type Definitions
 *
 * Types related to Dash framework integration.
 */

import type { LoadingState } from './index';

// =============================================================================
// Dash Component ID Types
// =============================================================================

/**
 * Dash component ID - can be a simple string or a pattern-matching object
 */
export type DashId =
  | string
  | {
      type: string;
      index: string | number;
      [key: string]: string | number; // Additional pattern-matching keys
    };

// =============================================================================
// Dash Props Types
// =============================================================================

/**
 * Type for Dash setProps function
 */
export type SetProps<T> = (props: Partial<T>) => void;

/**
 * Base props that all Dash components receive
 */
export interface DashComponentProps {
  /** Component ID (required for callbacks) */
  id?: DashId;
  /** Dash loading state */
  loading_state?: LoadingState;
  /** Function to update props (provided by Dash) */
  setProps?: SetProps<Record<string, unknown>>;
}

/**
 * Props for Dash component persistence
 */
export interface PersistenceProps {
  /** Whether to persist component state (or persistence key) */
  persistence?: boolean | string | number;
  /** Which props to persist */
  persisted_props?: string[];
  /** Storage type for persistence */
  persistence_type?: 'local' | 'session' | 'memory';
}

// =============================================================================
// Dash Component API Types
// =============================================================================

/**
 * Type for window.dash_component_api
 */
export interface DashComponentApi {
  /**
   * Get a layout component by path
   * @param path Array of keys to traverse the layout tree
   */
  getLayout(path: (string | number)[]): Record<string, unknown> | null;
}
