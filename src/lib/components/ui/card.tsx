import * as React from 'react';

/**
 * Card - shadcn/ui style card component for Kaleido
 *
 * A container component with consistent styling following
 * the Kaleido design system.
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        'rounded-lg border border-border',
        'bg-surface text-foreground',
        'shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={['flex flex-col space-y-1.5 p-4', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={[
      'text-lg font-semibold leading-none tracking-tight',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={['text-sm text-secondary', className].filter(Boolean).join(' ')}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={['p-4 pt-0', className].filter(Boolean).join(' ')}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={['flex items-center p-4 pt-0', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
