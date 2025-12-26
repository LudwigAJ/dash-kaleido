import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/utils/cn';
import { useKaleido } from '@/fragments/KaleidoManager/context';

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipRoot = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipPortal = TooltipPrimitive.Portal;

export interface TooltipContentProps extends React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> {
  /** Theme to apply - needed for portal rendering outside main container */
  theme?: 'light' | 'dark';
}

/**
 * Tooltip content with shadcn/ui styling
 * Theme class provides CSS variables for proper theming in portals.
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 4, theme = 'light', ...props }, ref) => {
  const themeClass = theme === 'dark' ? 'kaleido-theme-dark' : 'kaleido-theme-light';

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // Theme class for CSS variables
        themeClass,
        'z-[9999] overflow-hidden rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  );
});

TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
  /** Theme override - if not provided, uses context */
  theme?: 'light' | 'dark';
}

/**
 * Simple Tooltip wrapper for convenience.
 * Automatically uses theme from KaleidoContext when available.
 *
 * @example
 * <Tooltip content="Hello world">
 *   <button>Hover me</button>
 * </Tooltip>
 */
const Tooltip = ({
  children,
  content,
  side = 'top',
  delayDuration = 200,
  theme: themeProp,
  ...props
}: TooltipProps) => {
  // Try to get theme from context, fallback to prop or 'light'
  let contextTheme: 'light' | 'dark' = 'light';
  try {
    const kaleido = useKaleido();
    contextTheme = kaleido.theme;
  } catch {
    // Not inside KaleidoProvider, use prop or default
  }
  const theme = themeProp ?? contextTheme;

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side={side} theme={theme} {...props}>
            {content}
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
    </TooltipProvider>
  );
};

export { Tooltip, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent, TooltipPortal };
