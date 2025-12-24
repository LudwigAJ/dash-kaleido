import { useEffect, useRef, useState, useCallback } from 'react';
import type { Tab } from '@/types';
import type { UseDashSyncOptions, UseDashSyncReturn } from './types';

/**
 * useDashSync - Synchronize component state with Dash persistence
 *
 * Handles:
 * - Syncing controlled props FROM Dash (controlledTabs, controlledActiveTab)
 * - Syncing state TO Dash via setProps
 * - Preventing update loops with ref flags
 * - Building activeTabData and tabsData for callbacks
 * - Tracking last sync time for status bar
 */
export function useDashSync({
  tabs,
  activeTabId,
  controlledTabs,
  controlledActiveTab,
  persistence,
  setProps,
  setTabs,
  setActiveTabId,
}: UseDashSyncOptions): UseDashSyncReturn {
  // Track if we're currently updating from internal action
  const isInternalUpdate = useRef(false);
  const isTabsInternalUpdate = useRef(false);
  const isInitialRender = useRef(true);
  const lastSentTabsDataSignature = useRef<string | null>(null);

  // Track if we've received initial props from Dash (for persistence)
  const hasReceivedInitialProps = useRef(
    !!(controlledTabs && Array.isArray(controlledTabs) && controlledTabs.length > 0)
  );

  // Status bar sync time
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());

  // Sync controlled activeTab from Dash/Python to internal state
  useEffect(() => {
    // Skip if this is our own update cycling back
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    if (controlledActiveTab !== undefined && controlledActiveTab !== null) {
      // Find the tab with matching layoutId
      const matchingTab = tabs.find((tab) => tab.layoutId === controlledActiveTab);
      if (matchingTab && matchingTab.id !== activeTabId) {
        setActiveTabId(matchingTab.id);
      }
    }
  }, [controlledActiveTab, tabs, activeTabId, setActiveTabId]);

  // Sync controlled tabs from Dash/Python to internal state
  useEffect(() => {
    // Skip if this is our own update cycling back
    if (isTabsInternalUpdate.current) {
      isTabsInternalUpdate.current = false;
      return;
    }

    if (controlledTabs !== undefined && controlledTabs !== null && Array.isArray(controlledTabs)) {
      // Mark that we've received props from Dash (for persistence timing)
      if (controlledTabs.length > 0) {
        hasReceivedInitialProps.current = true;
      }

      // Only update if tabs actually changed (compare by stringified value)
      const currentTabsStr = JSON.stringify(tabs);
      const controlledTabsStr = JSON.stringify(controlledTabs);
      if (currentTabsStr !== controlledTabsStr) {
        setTabs(controlledTabs);
        // If active tab no longer exists, switch to first tab
        if (!controlledTabs.find((t) => t.id === activeTabId)) {
          setActiveTabId(controlledTabs[0]?.id || null);
        }
      }
    }
  }, [controlledTabs, tabs, activeTabId, setTabs, setActiveTabId]);

  // Sync tabs and active tab TO Dash
  useEffect(() => {
    if (!setProps) return;

    // If persistence is enabled and this is the initial render,
    // skip the first sync to allow Dash to potentially send persisted data.
    if (isInitialRender.current) {
      isInitialRender.current = false;
      if (persistence && (!controlledTabs || controlledTabs.length === 0)) {
        return;
      }
    }

    const activeTab = tabs.find((tab) => tab.id === activeTabId);
    const layoutId = activeTab?.layoutId || null;

    // Build activeTabData - null if the tab has no layout selected (New Tab)
    const activeTabData: Tab | null = activeTab
      ? {
          id: activeTab.id,
          layoutId: activeTab.layoutId,
          name: activeTab.name,
          createdAt: activeTab.createdAt,
          layoutParams: activeTab.layoutParams || undefined,
          layoutParamOptionKey: activeTab.layoutParamOptionKey || undefined,
        }
      : null;

    // Build tabsData - only tabs that have a layout selected
    const tabsWithLayouts = tabs.filter((t) => t.layoutId);
    const currentSignature = tabsWithLayouts
      .map((t) => `${t.id}:${t.layoutId}:${JSON.stringify(t.layoutParams || {})}`)
      .sort()
      .join('|');

    const tabsDataChanged = currentSignature !== lastSentTabsDataSignature.current;

    // Mark that we're doing an internal update
    isInternalUpdate.current = true;
    isTabsInternalUpdate.current = true;

    // Build the props to send
    const propsToSend: Record<string, unknown> = {
      activeTab: layoutId,
      activeTabData: activeTabData,
      tabs: tabs,
    };

    // Only include tabsData if it changed
    if (tabsDataChanged) {
      propsToSend.tabsData = tabsWithLayouts.map((t) => ({
        id: t.id,
        layoutId: t.layoutId,
        layoutParams: t.layoutParams || null,
      }));
      lastSentTabsDataSignature.current = currentSignature;
    }

    // Send to Dash
    setProps(propsToSend);

    // Update last sync time
    setLastSyncTime(Date.now());
  }, [activeTabId, tabs, setProps, persistence, controlledTabs]);

  // Function to mark that an internal update is happening
  const markInternalUpdate = useCallback(() => {
    isInternalUpdate.current = true;
    isTabsInternalUpdate.current = true;
  }, []);

  return {
    lastSyncTime,
    markInternalUpdate,
    hasReceivedInitialProps: hasReceivedInitialProps.current,
  };
}

export default useDashSync;
