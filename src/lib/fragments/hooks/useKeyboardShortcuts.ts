import { useEffect } from 'react';
import type { UseKeyboardShortcutsOptions } from './types';

/**
 * useKeyboardShortcuts - Global keyboard shortcut handler
 *
 * Handles:
 * - Ctrl+N: New tab
 * - Ctrl+D: Delete current tab
 * - Ctrl+L: Lock/unlock current tab
 * - Ctrl+R: Rename current tab
 * - Ctrl+I: Show info for current tab (if it has a layout)
 * - Ctrl+J: Switch to left tab
 * - Ctrl+K: Switch to right tab
 * - F1 or ?: Open help modal
 * - Tab: Focus search bar
 */
export function useKeyboardShortcuts({
  tabs,
  activeTabId,
  addTab,
  removeTab,
  selectTab,
  lockTab,
  unlockTab,
  startRename,
  showInfo,
  searchInputRef,
  shouldShowSearchBar,
  showSearchDropdown,
  setShowHelpModal,
  enabled = true,
}: UseKeyboardShortcutsOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs (except for specific cases)
      const activeElement = document.activeElement as HTMLElement | null;
      const isInInput =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.isContentEditable);

      // Ctrl/Cmd + N: Create new tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        addTab();
        return;
      }

      // Ctrl/Cmd + D: Delete current tab (if not locked)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        const currentTab = tabs.find((t) => t.id === activeTabId);
        if (currentTab && !currentTab.locked && activeTabId) {
          removeTab(activeTabId);
        }
        return;
      }

      // Ctrl/Cmd + L: Lock/unlock current tab
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        const currentTab = tabs.find((t) => t.id === activeTabId);
        if (currentTab && activeTabId) {
          if (currentTab.locked) {
            unlockTab(activeTabId);
          } else if (currentTab.layoutId) {
            // Can only lock tabs with a layout
            lockTab(activeTabId);
          }
        }
        return;
      }

      // Ctrl/Cmd + R: Rename current tab (if not locked)
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        const currentTab = tabs.find((t) => t.id === activeTabId);
        if (currentTab && !currentTab.locked) {
          startRename(currentTab);
        }
        return;
      }

      // Ctrl/Cmd + I: Show info for current tab (if it has a layout)
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        const currentTab = tabs.find((t) => t.id === activeTabId);
        if (currentTab && currentTab.layoutId) {
          showInfo(currentTab);
        }
        return;
      }

      // Ctrl/Cmd + J: Switch to tab on the left
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
        if (currentIndex > 0) {
          selectTab(tabs[currentIndex - 1].id);
        }
        return;
      }

      // Ctrl/Cmd + K: Switch to tab on the right
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
        if (currentIndex < tabs.length - 1) {
          selectTab(tabs[currentIndex + 1].id);
        }
        return;
      }

      // F1 or ? (without modifiers): Open help modal
      if (e.key === 'F1' || (e.key === '?' && !e.ctrlKey && !e.metaKey && !isInInput)) {
        e.preventDefault();
        setShowHelpModal(true);
        return;
      }

      // Tab key (without modifiers): Focus search bar
      // Only if search bar is visible, we're not already in an input, and dropdown is not showing
      if (e.key === 'Tab' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Don't intercept Tab if dropdown is visible (handled by search keydown)
        if (showSearchDropdown) return;

        if (shouldShowSearchBar && searchInputRef?.current && !isInInput) {
          e.preventDefault();
          searchInputRef.current.focus();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    enabled,
    tabs,
    activeTabId,
    addTab,
    removeTab,
    selectTab,
    lockTab,
    unlockTab,
    startRename,
    showInfo,
    searchInputRef,
    shouldShowSearchBar,
    showSearchDropdown,
    setShowHelpModal,
  ]);
}

export default useKeyboardShortcuts;
