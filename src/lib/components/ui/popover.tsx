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
  /** Theme to apply - needed for portal rendering outside main container */
  theme?: 'light' | 'dark';
}

/**
 * Popover content with shadcn/ui styling
 * Theme class provides CSS variables for proper theming in portals.
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
      theme = 'light',
      children,
      ...props
    },
    ref
  ) => {
    const themeClass = theme === 'dark' ? 'kaleido-theme-dark' : 'kaleido-theme-light';

    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          className={cn(
            // Theme class for CSS variables
            themeClass,
            'z-[9999] w-72 rounded-lg p-3 shadow-lg outline-none',
            'text-sm',
            // Use Tailwind classes that reference CSS variables
            'bg-surface border border-border text-foreground',
            className
          )}
          {...props}
        >
          {children}
          {showArrow && <PopoverPrimitive.Arrow className="fill-popover" />}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  }
);

PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor, PopoverPortal, PopoverClose };
