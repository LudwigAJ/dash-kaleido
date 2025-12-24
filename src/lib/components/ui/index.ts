/**
 * Kaleido UI Components
 * shadcn/ui components adapted for Dash Kaleido
 *
 * All components use TypeScript and follow shadcn patterns.
 */

// Utility
export { cn } from '@/utils/cn';

// Components
export { Button } from './button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './button';

export {
  Tooltip,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
} from './tooltip';
export type { TooltipProps } from './tooltip';

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverPortal,
  PopoverClose,
} from './popover';
export type { PopoverContentProps } from './popover';

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './dialog';
export type { DialogContentProps } from './dialog';

export { Spinner, LoadingOverlay, spinnerSizes } from './spinner';
export type {
  SpinnerProps,
  SpinnerSize,
  LoadingOverlayProps,
} from './spinner';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card';
export type { CardProps } from './card';

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
} from './context-menu';

export { Input } from './input';
export type { InputProps } from './input';

export { Label } from './label';
export type { LabelProps } from './label';

export { Separator } from './separator';
export type { SeparatorProps } from './separator';
