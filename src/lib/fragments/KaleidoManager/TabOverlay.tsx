import React from 'react';
import type { Tab } from '@/types';

export interface TabOverlayProps {
  /** Tab data object to display in the overlay */
  tab: Tab | null;
}

/**
 * TabOverlay component for DnD Kit DragOverlay
 *
 * This is a presentational-only component that shows a floating
 * copy of the tab being dragged. It doesn't use any hooks.
 */
const TabOverlay: React.FC<TabOverlayProps> = ({ tab }) => {
  if (!tab) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border bg-background text-foreground text-xs shadow-lg">
      <span className="whitespace-nowrap">
        {tab.name.length > 24 ? `${tab.name.slice(0, 24)}…` : tab.name}
      </span>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders during drag operations
export default React.memo(TabOverlay);
