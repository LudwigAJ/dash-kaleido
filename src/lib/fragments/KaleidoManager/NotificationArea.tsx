import React from 'react';
import type { Notification } from '@/types';
import {
  Cross2Icon,
  BellIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from '@radix-ui/react-icons';
import { Tooltip, Popover, PopoverTrigger, PopoverContent } from '@/components/ui';

/**
 * Get the appropriate icon for a notification type
 */
const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  switch (type) {
    case 'error':
      return <ExclamationTriangleIcon />;
    case 'success':
      return <CheckCircledIcon />;
    case 'info':
    default:
      return <InfoCircledIcon />;
  }
};

/**
 * Get the color class for a notification type
 */
const getTypeColorClass = (type: Notification['type']): string => {
  switch (type) {
    case 'error':
      return 'text-destructive';
    case 'success':
      return 'text-green-500';
    case 'info':
    default:
      return 'text-primary';
  }
};

/**
 * Get the border class for a notification type
 */
const getTypeBorderClass = (type: Notification['type']): string => {
  switch (type) {
    case 'error':
      return 'border-l-[3px] border-l-destructive';
    case 'success':
      return 'border-l-[3px] border-l-green-500';
    case 'info':
    default:
      return 'border-l-[3px] border-l-primary';
  }
};

export interface NotificationAreaProps {
  /** Array of notification objects */
  notifications: Notification[];
  /** Function to update notifications array */
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  /** Whether the history popover is open */
  showHistory: boolean;
  /** Function to toggle history popover */
  setShowHistory: (show: boolean) => void;
}

/**
 * NotificationArea - Displays toast notifications with a history popover
 *
 * Features:
 * - Shows most recent notification as a toast
 * - Badge showing total count when multiple notifications
 * - Popover with full notification history
 * - Clear all and dismiss individual notifications
 */
const NotificationArea: React.FC<NotificationAreaProps> = ({
  notifications,
  setNotifications,
  showHistory,
  setShowHistory,
}) => {
  if (notifications.length === 0) {
    return null;
  }

  const latestNotification = notifications[notifications.length - 1];

  const handleDismissLatest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    setNotifications([]);
    setShowHistory(false);
  };

  return (
    <div
      className={[
        'absolute bottom-8 right-3 z-[1500]',
        'flex flex-col items-end gap-2',
        'max-w-[350px]',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Popover open={showHistory} onOpenChange={setShowHistory}>
        <PopoverTrigger asChild>
          {/* Show most recent notification */}
          <div
            className={[
              'flex items-center gap-2 py-2.5 px-3.5',
              'bg-surface border border-border rounded-md',
              'shadow-md text-sm animate-slide-in',
              getTypeBorderClass(latestNotification.type),
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              cursor: notifications.length > 1 ? 'pointer' : 'default',
            }}
          >
            <span
              className={['flex-shrink-0 text-sm', getTypeColorClass(latestNotification.type)]
                .filter(Boolean)
                .join(' ')}
            >
              <NotificationIcon type={latestNotification.type} />
            </span>
            <span className="flex-1 text-foreground leading-snug">
              {latestNotification.message}
            </span>
            {notifications.length > 1 && (
              <Tooltip content="Click to see all notifications" delayDuration={200}>
                <span
                  className={[
                    'flex-shrink-0 bg-primary text-background',
                    'text-[10px] font-semibold',
                    'px-1.5 py-0.5 rounded-full',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {notifications.length}
                </span>
              </Tooltip>
            )}
            <button
              className={[
                'flex-shrink-0 text-secondary transition-colors',
                'p-0.5 leading-none',
                'hover:text-foreground',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={handleDismissLatest}
            >
              <Cross2Icon />
            </button>
          </div>
        </PopoverTrigger>

        {/* Notification History Popover */}
        {notifications.length > 1 && (
          <PopoverContent
            className={['w-80 max-h-[300px] p-0', 'overflow-hidden'].filter(Boolean).join(' ')}
            sideOffset={8}
            align="end"
          >
            <div
              className={[
                'flex justify-between items-center',
                'px-3 py-2.5 bg-surface-dim',
                'border-b border-border',
                'text-xs font-semibold text-foreground',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="flex items-center gap-1.5">
                <BellIcon />
                Notifications ({notifications.length})
              </span>
              <button
                className={[
                  'text-primary text-xs px-2 py-1',
                  'rounded transition-colors',
                  'hover:bg-primary/15',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
            <div className="max-h-[250px] overflow-y-auto">
              {[...notifications].reverse().map((notification) => (
                <div
                  key={notification.id}
                  className={[
                    'flex items-start gap-2',
                    'px-3 py-2.5',
                    'border-b border-border last:border-b-0',
                    'text-xs',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span
                    className={['mt-0.5', getTypeColorClass(notification.type)]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <NotificationIcon type={notification.type} />
                  </span>
                  <span className="flex-1 text-foreground">{notification.message}</span>
                  <span className="flex-shrink-0 text-secondary text-[10px]">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders during tab operations
export default React.memo(NotificationArea);
