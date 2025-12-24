import React from 'react';
import { LockClosedIcon } from '@radix-ui/react-icons';
import { Tooltip, Card } from '@/components/ui';
import type { LayoutMetadata } from '@/types';

export interface LayoutWithIdProps extends LayoutMetadata {
  id: string;
}

export interface LayoutCardProps {
  layout: LayoutWithIdProps;
  isSelected?: boolean;
  isDisabled?: boolean;
  onSelect?: (layoutId: string) => void;
}

/**
 * LayoutCard - Individual layout card for the New Tab view
 * Uses shadcn/ui Card component for consistent styling
 *
 * Displays:
 * - Layout name
 * - Description
 * - Disabled state (already open)
 *
 * Note: Keywords are used for searching only, not displayed on cards
 */
const LayoutCard: React.FC<LayoutCardProps> = ({
  layout,
  isSelected = false,
  isDisabled = false,
  onSelect,
}) => {
  const handleClick = () => {
    if (!isDisabled) {
      onSelect?.(layout.id);
    }
  };

  const cardContent = (
    <Card
      className={[
        'p-5 cursor-pointer transition-all duration-200',
        'flex flex-col h-full',
        'hover:-translate-y-0.5 hover:shadow-md hover:border-primary/50',
        isSelected &&
          'ring-2 ring-primary ring-offset-2 ring-offset-background',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
    >
      <h3 className="text-base font-semibold mb-1.5 text-foreground leading-tight">
        {layout.name}
      </h3>
      <p className="text-sm text-secondary leading-relaxed">
        {layout.description}
      </p>
      {isDisabled && (
        <div
          className={[
            'absolute top-2 right-2',
            'flex items-center gap-1',
            'bg-surface-dim text-secondary',
            'px-2 py-1 rounded-md',
            'text-xs font-medium',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <LockClosedIcon className="w-3 h-3" />
          Already open
        </div>
      )}
    </Card>
  );

  // Wrap with tooltip if disabled
  if (isDisabled) {
    return (
      <Tooltip
        content="This layout is already open in another tab"
        delayDuration={400}
      >
        <div className="relative h-full">{cardContent}</div>
      </Tooltip>
    );
  }

  return <div className="relative h-full">{cardContent}</div>;
};

export default React.memo(LayoutCard);
