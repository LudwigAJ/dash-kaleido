import { useState, useCallback, useRef, useEffect } from 'react';
import type { Tab } from '@/types';
import type { UseTabManagementOptions, UseTabManagementReturn } from './types';

/**
 * useTabManagement - Custom hook for tab CRUD operations
 *
 * Handles:
 * - Tab state (tabs array, active tab ID)
 * - Add/remove/rename/select tabs
 * - Lock/unlock tabs
 * - Inline rename state
 * - Tab limit enforcement (maxTabs)
 */
export function useTabManagement({
  generateUUID,
  maxTabs = -1,
  registeredLayouts = {},
  initialTabs = null,
  initialTab = null,
  onResetLayoutSelection,
}: UseTabManagementOptions): UseTabManagementReturn {
  // Initialize tabs state - restore from persistence or create default
  const [tabs, setTabs] = useState<Tab[]>(() => {
    // Check for persisted tabs
    if (initialTabs && Array.isArray(initialTabs) && initialTabs.length > 0) {
      // Migrate old tabs: convert createdAt from ISO string to Unix timestamp (ms)
      const migratedTabs = initialTabs.map((tab) => ({
        ...tab,
        createdAt:
          typeof tab.createdAt === 'string'
            ? new Date(tab.createdAt).getTime()
            : tab.createdAt || Date.now(),
      }));
      return migratedTabs;
    }

    // No persisted state - check for initialTab
    if (initialTab && registeredLayouts[initialTab]) {
      return [
        {
          id: generateUUID(),
          name: registeredLayouts[initialTab]?.name || 'Untitled',
          layoutId: initialTab,
          createdAt: Date.now(),
        },
      ];
    }

    // Default: create a new tab (layout selector)
    return [
      {
        id: generateUUID(),
        name: 'New Tab',
        layoutId: null,
        createdAt: Date.now(),
      },
    ];
  });

  // Initialize active tab - restore from persisted tabs or use first tab
  const [activeTabId, setActiveTabId] = useState<string | null>(() => tabs[0]?.id || null);

  // Inline rename state
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Refs to avoid stale closures in rename handlers
  const editingTabIdRef = useRef<string | null>(null);
  const editingTabNameRef = useRef('');

  // Derived state
  const activeTab = tabs.find((t) => t.id === activeTabId) || null;
  const canAddTab = maxTabs < 0 || tabs.length < maxTabs;

  // Focus input when editing starts
  useEffect(() => {
    if (editingTabId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [editingTabId]);

  // Add a new tab
  const addTab = useCallback((): Tab | null => {
    if (maxTabs > 0 && tabs.length >= maxTabs) {
      return null;
    }

    const newTab: Tab = {
      id: generateUUID(),
      name: 'New Tab',
      layoutId: null,
      locked: false,
      createdAt: Date.now(),
    };

    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);

    return newTab;
  }, [generateUUID, maxTabs, tabs.length]);

  // Remove a tab
  const removeTab = useCallback(
    (tabId: string) => {
      // Don't remove locked tabs
      const tabToRemove = tabs.find((t) => t.id === tabId);
      if (tabToRemove?.locked) return;

      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((t) => t.id !== tabId);

        // If this is the last tab, create a new "New Tab" instead
        if (newTabs.length === 0) {
          const newTab: Tab = {
            id: generateUUID(),
            name: 'New Tab',
            layoutId: null,
            locked: false,
            createdAt: Date.now(),
          };
          setActiveTabId(newTab.id);
          return [newTab];
        }

        return newTabs;
      });

      // If removing active tab, switch to another
      setActiveTabId((prevActiveId) => {
        if (tabId === prevActiveId) {
          const remainingTabs = tabs.filter((t) => t.id !== tabId);
          const removedIndex = tabs.findIndex((t) => t.id === tabId);
          const newIndex = Math.max(0, removedIndex - 1);
          return remainingTabs[newIndex]?.id || remainingTabs[0]?.id;
        }
        return prevActiveId;
      });

      // Reset layout selection state if provided
      onResetLayoutSelection?.();
    },
    [generateUUID, tabs, onResetLayoutSelection]
  );

  // Select a tab
  const selectTab = useCallback(
    (tabId: string) => {
      // Reset layout selection state when switching tabs
      onResetLayoutSelection?.();
      setActiveTabId(tabId);
    },
    [onResetLayoutSelection]
  );

  // Rename a tab
  const renameTab = useCallback((tabId: string, newName: string) => {
    setTabs((prevTabs) => prevTabs.map((t) => (t.id === tabId ? { ...t, name: newName } : t)));
  }, []);

  // Lock a tab (only if it has a layout)
  const lockTab = useCallback((tabId: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((t) => {
        if (t.id === tabId && t.layoutId) {
          return { ...t, locked: true };
        }
        return t;
      })
    );
  }, []);

  // Unlock a tab
  const unlockTab = useCallback((tabId: string) => {
    setTabs((prevTabs) => prevTabs.map((t) => (t.id === tabId ? { ...t, locked: false } : t)));
  }, []);

  // Pin or unpin a tab
  const pinTab = useCallback((tabId: string, pinned: boolean) => {
    setTabs((prevTabs) => prevTabs.map((t) => (t.id === tabId ? { ...t, pinned } : t)));
  }, []);

  // Duplicate a tab
  const duplicateTab = useCallback(
    (tabId: string) => {
      setTabs((prevTabs) => {
        const tab = prevTabs.find((t) => t.id === tabId);
        if (!tab) return prevTabs;
        const newTab: Tab = {
          ...tab,
          id: generateUUID(),
          name: `${tab.name} (copy)`,
          locked: false,
          pinned: false,
          createdAt: Date.now(),
        };
        const index = prevTabs.findIndex((t) => t.id === tabId);
        const newTabs = [...prevTabs];
        newTabs.splice(index + 1, 0, newTab);
        return newTabs;
      });
    },
    [generateUUID]
  );

  // Start inline rename
  const startRename = useCallback((tab: Tab) => {
    if (tab.locked) return;
    setEditingTabId(tab.id);
    setEditingTabName(tab.name);
    editingTabIdRef.current = tab.id;
    editingTabNameRef.current = tab.name;
  }, []);

  // Finish inline rename
  const finishRename = useCallback(() => {
    const tabId = editingTabIdRef.current;
    const tabName = editingTabNameRef.current;
    if (tabId && tabName.trim()) {
      setTabs((prevTabs) =>
        prevTabs.map((t) => (t.id === tabId ? { ...t, name: tabName.trim() } : t))
      );
    }
    editingTabIdRef.current = null;
    editingTabNameRef.current = '';
    setEditingTabId(null);
    setEditingTabName('');
  }, []);

  // Cancel inline rename
  const cancelRename = useCallback(() => {
    editingTabIdRef.current = null;
    editingTabNameRef.current = '';
    setEditingTabId(null);
    setEditingTabName('');
  }, []);

  // Handle rename input change
  const handleRenameInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditingTabName(value);
    editingTabNameRef.current = value;
  }, []);

  // Handle rename blur with setTimeout to ensure we have the latest ref values
  const handleRenameBlur = useCallback(() => {
    setTimeout(() => {
      const tabId = editingTabIdRef.current;
      const tabName = editingTabNameRef.current;
      if (tabId && tabName.trim()) {
        setTabs((prevTabs) =>
          prevTabs.map((t) => (t.id === tabId ? { ...t, name: tabName.trim() } : t))
        );
      }
      editingTabIdRef.current = null;
      editingTabNameRef.current = '';
      setEditingTabId(null);
      setEditingTabName('');
    }, 0);
  }, []);

  // Update a tab's layout
  const updateTabLayout = useCallback(
    (
      tabId: string,
      layoutId: string,
      layoutName: string,
      layoutParams: Record<string, string> | null = null,
      layoutParamOptionKey: string | null = null
    ) => {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === tabId
            ? {
                ...tab,
                name: layoutName,
                layoutId: layoutId,
                layoutParams: layoutParams || undefined,
                layoutParamOptionKey: layoutParamOptionKey || undefined,
              }
            : tab
        )
      );
    },
    []
  );

  return {
    // State
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    activeTab,
    canAddTab,

    // Rename state
    editingTabId,
    editingTabName,
    renameInputRef,

    // Tab operations
    addTab,
    removeTab,
    selectTab,
    renameTab,
    lockTab,
    unlockTab,
    pinTab,
    duplicateTab,
    updateTabLayout,

    // Rename operations
    startRename,
    finishRename,
    cancelRename,
    handleRenameInputChange,
    handleRenameBlur,
  };
}

export default useTabManagement;
