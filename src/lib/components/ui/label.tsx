import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

/**
 * Label component with shadcn/ui styling
 * Accessible form label built on Radix UI Label primitive
 */

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={[
      'text-sm font-medium leading-none',
      'text-foreground',
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
