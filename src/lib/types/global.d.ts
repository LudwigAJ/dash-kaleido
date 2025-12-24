/**
 * Global Type Declarations
 *
 * Augments global types like Window with Dash-specific properties.
 */

import type { DashComponentApi } from './dash';

declare global {
  interface Window {
    /**
     * Dash Component API - available at runtime in Dash apps
     */
    dash_component_api?: DashComponentApi;
  }
}

// This export makes the file a module (required for declaration merging)
export {};
