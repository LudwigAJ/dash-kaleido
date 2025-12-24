import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/utils/cn';

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverPortal = PopoverPrimitive.Portal;
const PopoverClose = PopoverPrimitive.Close;

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> {
  showArrow?: boolean;
}

/**
 * Popover content with shadcn/ui styling
 * Uses inline styles to ensure proper rendering in portals
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    {
      className,
      align = 'center',
      sideOffset = 4,
      collisionPadding = 8,
      showArrow = false,
      children,
      ...props
    },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn('z-[9999] w-72 rounded-lg p-3 shadow-lg outline-none', 'text-sm', className)}
        style={{
          backgroundColor: 'var(--kaleido-surface, #f8fafc)',
          borderColor: 'var(--kaleido-border, #e2e8f0)',
          borderWidth: '1px',
          borderStyle: 'solid',
          color: 'var(--kaleido-foreground, #0f172a)',
        }}
        {...props}
      >
        {children}
        {showArrow && <PopoverPrimitive.Arrow className="fill-popover" />}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
);

PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverPortal, PopoverClose };
