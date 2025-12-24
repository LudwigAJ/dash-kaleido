/**
 * Default configuration values for KaleidoManager
 */

import type { SearchBarConfig, Theme, Size } from '@/types';

/**
 * Default search bar configuration
 */
export const defaultSearchBarConfig = {
  show: false,
  placeholder: 'Search layouts...',
  position: 'under' as const,
  showDropdownInNewTab: false,
  spawnLayoutInNewTab: false,
  displayedLayouts: null as string[] | null, // null means fallback to parent displayedLayouts prop
};

/**
 * Default component props for KaleidoManager
 */
export const defaultProps = {
  theme: 'light' as Theme,
  size: 'md' as Size,
  maxTabs: -1,
  contentOverflow: 'auto' as const,
  enableStatusBar: false,
  persistence: false,
  persistence_type: 'local' as const,
  persisted_props: ['activeTab', 'tabs'] as string[],
};
