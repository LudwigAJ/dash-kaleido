import React from 'react';
import LayoutCard, { LayoutWithIdProps } from './LayoutCard';

export interface NewTabContentProps {
  layouts: LayoutWithIdProps[];
  selectedIndex?: number;
  highlightCards?: boolean;
  isLayoutDisabled?: (layoutId: string) => boolean;
  onLayoutSelect?: (layoutId: string) => void;
  theme?: string;
  size?: string;
}

/**
 * NewTabContent - Layout selector grid for "New Tab" view
 *
 * Displays available layouts as cards that users can click to open.
 * Supports keyboard navigation when not in dropdown mode.
 */
const NewTabContent: React.FC<NewTabContentProps> = ({
  layouts,
  selectedIndex = 0,
  highlightCards = true,
  isLayoutDisabled,
  onLayoutSelect,
  theme = 'light',
  size = 'md',
}) => {
  return (
    <div className={`p-6 bg-background kaleido-theme-${theme} kaleido-size-${size}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {layouts.map((layout, index) => (
          <LayoutCard
            key={layout.id}
            layout={layout}
            isSelected={highlightCards && index === selectedIndex}
            isDisabled={isLayoutDisabled?.(layout.id) || false}
            onSelect={onLayoutSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(NewTabContent);
