/**
 * KaleidoManager Sub-Components
 *
 * These components are internal to KaleidoManager and handle
 * specific parts of the manager UI:
 *
 * - TabBar: DnD-enabled tab bar with sortable tabs
 * - StatusBar: Optional status bar at the bottom
 * - NewTabContent: Layout selector grid for "New Tab" view
 * - LayoutCard: Individual layout card component
 */

export { default as TabBar } from './TabBar';
export { default as StatusBar } from './StatusBar';
export { default as NewTabContent } from './NewTabContent';
export { default as LayoutCard } from './LayoutCard';

// Re-export types
export type { TabBarProps } from './TabBar';
export type { StatusBarProps, StatusBarMode } from './StatusBar';
export type { NewTabContentProps } from './NewTabContent';
export type { LayoutCardProps, LayoutWithIdProps } from './LayoutCard';
