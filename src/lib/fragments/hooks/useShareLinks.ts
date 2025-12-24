import { useEffect, useCallback } from 'react';
import type { Tab } from '@/types';
import type {
  UseShareLinksOptions,
  UseShareLinksReturn,
  ShareData,
} from './types';

/**
 * useShareLinks - URL hash-based tab sharing system
 *
 * Handles:
 * - Generating share links (base64 encoded tab data)
 * - Copying share links to clipboard
 * - Processing URL hash on mount (direct link opens)
 * - Listening for hash changes (pasted links while open)
 * - Spawning shared tabs from decoded data
 *
 * Share Link Format: https://example.com/app#k:<base64-encoded-json>
 */
export function useShareLinks({
  tabs,
  registeredLayouts,
  maxTabs,
  generateUUID,
  setTabs,
  setActiveTabId,
  addNotification,
}: UseShareLinksOptions): UseShareLinksReturn {
  // Generate share link for a tab
  const generateShareLink = useCallback(
    (tab: Tab): string | null => {
      if (!tab.layoutId) return null;

      const shareData: ShareData = {
        layoutId: tab.layoutId,
        name: tab.name,
      };

      // Include params if present
      if (tab.layoutParams) {
        shareData.layoutParams = tab.layoutParams as Record<
          string,
          string
        >;
      }
      if (tab.layoutParamOptionKey) {
        shareData.layoutParamOptionKey = tab.layoutParamOptionKey;
      }

      const encoded = btoa(JSON.stringify(shareData));
      const currentUrl = window.location.href.split('#')[0];
      return `${currentUrl}#k:${encoded}`;
    },
    []
  );

  // Copy share link to clipboard
  const shareTab = useCallback(
    (tab: Tab | null) => {
      if (!tab) return;

      if (!tab.layoutId) {
        addNotification?.('error', 'Cannot share a tab without a layout');
        return;
      }

      const shareLink = generateShareLink(tab);
      if (shareLink) {
        navigator.clipboard
          .writeText(shareLink)
          .then(() => {
            addNotification?.('success', 'Link copied to clipboard');
          })
          .catch(() => {
            addNotification?.(
              'error',
              'Failed to copy link to clipboard'
            );
          });
      }
    },
    [generateShareLink, addNotification]
  );

  // Spawn a shared tab from decoded data
  const spawnSharedTab = useCallback(
    (shareData: ShareData): boolean => {
      const { layoutId, name, layoutParams, layoutParamOptionKey } =
        shareData;

      // Validate layout exists
      if (!registeredLayouts || !registeredLayouts[layoutId]) {
        addNotification?.(
          'error',
          `Layout "${layoutId}" does not exist`
        );
        return false;
      }

      const layoutInfo = registeredLayouts[layoutId];

      // Check if layout allows multiple instances
      if (!layoutInfo.allowMultiple) {
        const existingTab = tabs.find((t) => t.layoutId === layoutId);
        if (existingTab) {
          addNotification?.(
            'error',
            `Layout "${layoutInfo.name}" only allows one instance. Switching to existing tab.`
          );
          setActiveTabId(existingTab.id);
          return false;
        }
      }

      // Check maxTabs limit
      if (maxTabs && maxTabs > 0 && tabs.length >= maxTabs) {
        addNotification?.(
          'error',
          `Cannot open shared tab: maximum tabs (${maxTabs}) reached`
        );
        return false;
      }

      // Create the new tab
      const newTab: Tab = {
        id: generateUUID(),
        name: name || layoutInfo.name || 'Shared Tab',
        layoutId: layoutId,
        locked: false,
        createdAt: Date.now(),
        layoutParams: layoutParams || undefined,
        layoutParamOptionKey: layoutParamOptionKey || undefined,
      };

      setTabs((prevTabs) => [...prevTabs, newTab]);
      setActiveTabId(newTab.id);

      return true;
    },
    [
      registeredLayouts,
      tabs,
      maxTabs,
      generateUUID,
      setTabs,
      setActiveTabId,
      addNotification,
    ]
  );

  // Process URL hash for shared tabs
  const processShareHash = useCallback(() => {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#k:')) return;

    const encoded = hash.slice(3);

    try {
      const decoded = atob(encoded);
      const shareData = JSON.parse(decoded) as ShareData;

      if (!shareData.layoutId) {
        addNotification?.('error', 'Invalid share link: missing layout');
        return;
      }

      spawnSharedTab(shareData);
    } catch {
      addNotification?.('error', 'Invalid share link');
    } finally {
      // Clear the hash from URL
      if (window.history.replaceState) {
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );
      } else {
        window.location.hash = '';
      }
    }
  }, [spawnSharedTab, addNotification]);

  // Listen for hash changes (user pastes link while Kaleido is open)
  useEffect(() => {
    const handleHashChange = () => {
      processShareHash();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [processShareHash]);

  // Process hash on initial mount (user opens link directly)
  useEffect(() => {
    // Small delay to ensure component is fully mounted and registeredLayouts is populated
    const timer = setTimeout(() => {
      processShareHash();
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return {
    generateShareLink,
    shareTab,
    spawnSharedTab,
    processShareHash,
  };
}

export default useShareLinks;
