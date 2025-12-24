/**
 * Dash Component Wrappers
 *
 * These are the main Dash components exported for use in the package.
 * Each wrapper component delegates to its corresponding fragment component.
 *
 * - DashKaleido: Example/demo component
 * - KaleidoManager: Main tab/layout manager
 * - KaleidoTab: Tab content container
 */

export { default as DashKaleido } from './DashKaleido';
export { default as KaleidoManager } from './KaleidoManager';
export { default as KaleidoTab } from './KaleidoTab';

// Re-export UI components (shadcn-style)
export * from './ui';
