import React from 'react';
import type { DashId, SetProps, LoadingState } from '@/types';

export interface KaleidoTabProps {
  /**
   * The ID used to identify this component in Dash callbacks.
   * Should be a pattern-matching ID like {type: 'kaleido-tab-content', index: '<tab-uuid>'}.
   */
  id: DashId;

  /**
   * The content to render inside this tab.
   */
  children?: React.ReactNode;

  /**
   * Inline styles to apply to the tab container.
   * Used internally for display toggling.
   */
  style?: React.CSSProperties;

  /**
   * Additional CSS class names.
   */
  className?: string;

  /**
   * Object that holds the loading state object coming from dash-renderer.
   */
  loading_state?: LoadingState;

  /**
   * Dash-assigned callback that should be called to report property changes
   */
  setProps?: SetProps<KaleidoTabProps>;

  /**
   * Data attributes to pass through to the root element
   */
  [key: `data-${string}`]: string | undefined;
}

/**
 * KaleidoTab is a container for tab content within KaleidoManager.
 * Each tab's content is wrapped in a KaleidoTab component which handles
 * visibility toggling based on the active tab.
 */
const KaleidoTab: React.FC<KaleidoTabProps> = (props) => {
  const {
    id,
    children,
    style = {},
    className = '',
    loading_state,
    ...otherProps
  } = props;

  // Extract data-* attributes to pass to root element
  const dataAttributes = Object.keys(otherProps)
    .filter((key) => key.startsWith('data-'))
    .reduce<Record<string, string | undefined>>(
      (acc, key) => ({ ...acc, [key]: (otherProps as Record<string, string | undefined>)[key] }),
      {}
    );

  // Stringify ID for DOM id attribute
  const domId = typeof id === 'object' ? JSON.stringify(id) : id;

  // Check if component is in loading state
  const isLoading = loading_state?.is_loading;

  return (
    <div
      id={domId}
      className={`h-full w-full ${className}${isLoading ? ' animate-pulse' : ''}`}
      style={style}
      data-dash-is-loading={isLoading || undefined}
      {...dataAttributes}
    >
      {children}
    </div>
  );
};

export default KaleidoTab;
