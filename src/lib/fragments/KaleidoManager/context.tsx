import React, { createContext, useContext } from 'react';
import type { RegisteredLayouts } from '@/types';

/**
 * Theme type for Kaleido components
 */
export type KaleidoTheme = 'light' | 'dark';

/**
 * Size type for Kaleido components
 */
export type KaleidoSize = 'sm' | 'md' | 'lg';

/**
 * Context value for KaleidoContext
 */
export interface KaleidoContextValue {
  /** Current theme */
  theme: KaleidoTheme;
  /** Component size */
  size: KaleidoSize;
  /** Registered layout configurations */
  registeredLayouts: RegisteredLayouts;
}

/**
 * KaleidoContext - React Context for sharing theme, size, and layouts
 *
 * This context eliminates prop drilling by providing shared state to all
 * Kaleido components without passing through every layer.
 */
export const KaleidoContext = createContext<KaleidoContextValue | null>(null);

KaleidoContext.displayName = 'KaleidoContext';

/**
 * useKaleido - Hook to access KaleidoContext value
 *
 * @throws Error if used outside of KaleidoProvider
 *
 * @example
 * const { theme, size, registeredLayouts } = useKaleido();
 */
export const useKaleido = (): KaleidoContextValue => {
  const context = useContext(KaleidoContext);
  if (!context) {
    throw new Error('useKaleido must be used within a KaleidoProvider');
  }
  return context;
};

/**
 * Props for KaleidoProvider
 */
export interface KaleidoProviderProps {
  /** Current theme */
  theme: KaleidoTheme;
  /** Component size */
  size?: KaleidoSize;
  /** Registered layout configurations */
  registeredLayouts: RegisteredLayouts;
  /** Child components */
  children: React.ReactNode;
}

/**
 * KaleidoProvider - Context provider for Kaleido components
 *
 * Wrap your Kaleido component tree with this provider to enable
 * theme, size, and layout access via useKaleido hook.
 *
 * @example
 * <KaleidoProvider theme="dark" size="md" registeredLayouts={layouts}>
 *   <KaleidoManager ... />
 * </KaleidoProvider>
 */
export const KaleidoProvider: React.FC<KaleidoProviderProps> = ({
  theme,
  size = 'md',
  registeredLayouts,
  children,
}) => {
  const value: KaleidoContextValue = React.useMemo(
    () => ({
      theme,
      size,
      registeredLayouts,
    }),
    [theme, size, registeredLayouts]
  );

  return <KaleidoContext.Provider value={value}>{children}</KaleidoContext.Provider>;
};

KaleidoProvider.displayName = 'KaleidoProvider';

export default KaleidoContext;
