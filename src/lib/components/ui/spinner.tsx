import * as React from 'react';

/**
 * Spinner sizes mapping
 */
export const spinnerSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
} as const;

export type SpinnerSize = keyof typeof spinnerSizes;

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: SpinnerSize;
}

/**
 * Loading Spinner component with shadcn/ui styling
 * Uses an SVG-based spinner icon similar to shadcn's LoaderIcon
 *
 * @example
 * // Basic usage
 * <Spinner />
 *
 * // With size
 * <Spinner size="lg" />
 *
 * // With custom className
 * <Spinner className="text-blue-500" />
 */
const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size = 'sm', ...props }, ref) => (
    <svg
      ref={ref}
      role="status"
      aria-label="Loading"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[
        'animate-spin',
        spinnerSizes[size] || spinnerSizes.sm,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
);

Spinner.displayName = 'Spinner';

export interface LoadingOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  show?: boolean;
  text?: string;
  size?: SpinnerSize;
}

/**
 * Full-screen or container loading overlay with spinner
 *
 * @example
 * // Overlay a container
 * <div style={{ position: 'relative' }}>
 *   <LoadingOverlay show={isLoading} />
 *   {content}
 * </div>
 */
const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ className, show = true, text, size = 'xl', ...props }, ref) => {
    if (!show) return null;

    return (
      <div
        ref={ref}
        className={[
          'absolute inset-0 z-50',
          'flex flex-col items-center justify-center',
          'bg-background/80 backdrop-blur-sm',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      >
        <Spinner size={size} />
        {text && (
          <p className="mt-4 text-sm text-muted animate-pulse">{text}</p>
        )}
      </div>
    );
  }
);

LoadingOverlay.displayName = 'LoadingOverlay';

export { Spinner, LoadingOverlay };
