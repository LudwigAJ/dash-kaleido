import { useState, useCallback, useRef, useEffect } from 'react';
import type { Tab, LayoutMetadata, LayoutParameter } from '@/types';
import type {
  UseLayoutSelectionOptions,
  UseLayoutSelectionReturn,
  LayoutSelectionState,
  LayoutDisplayInfo,
  LoadingLayoutInfo,
  LayoutWithId,
  ParameterOption,
} from './types';

/**
 * useLayoutSelection - Custom hook for layout selection and parameter collection
 *
 * Handles:
 * - Layout selection flow
 * - Parameter collection (multi-step input)
 * - Parameter options dropdown (pre-defined configurations)
 * - Search query and dropdown state
 * - Layout filtering and display
 * - Per-tab state persistence (saves/restores state when switching tabs)
 */
export function useLayoutSelection({
  registeredLayouts = {},
  displayedLayouts = null,
  searchBarConfig = {},
  activeTabId,
  updateTabLayout,
  tabs = [],
}: UseLayoutSelectionOptions): UseLayoutSelectionReturn {
  // Per-tab state cache - stores searchbar state for each tab
  const tabStateCache = useRef<Record<string, LayoutSelectionState>>({});
  const previousTabIdRef = useRef<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedLayoutIndex, setSelectedLayoutIndex] = useState(0);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
  const [isEditingSearch, setIsEditingSearch] = useState(false);

  // Parameter input state - for layouts that require parameters
  const [pendingLayout, setPendingLayout] = useState<string | null>(null);
  const [pendingParams, setPendingParams] = useState<LayoutParameter[]>([]);
  const [currentParamIndex, setCurrentParamIndex] = useState(0);
  const [parameterValues, setParameterValues] = useState<Record<string, string>>({});
  const [paramInputValue, setParamInputValue] = useState('');
  const [showingDefault, setShowingDefault] = useState(false);

  // Parameter options state - for layouts with pre-defined parameter configurations
  const [showParamOptionsDropdown, setShowParamOptionsDropdown] = useState(false);
  const [paramOptions, setParamOptions] = useState<Record<string, ParameterOption>>({});
  const [selectedParamOptionIndex, setSelectedParamOptionIndex] = useState(0);
  const paramOptionsJustOpened = useRef(false);

  // Loading state - shows selected params/options while layout is loading
  const [loadingLayoutInfo, setLoadingLayoutInfo] = useState<LoadingLayoutInfo | null>(null);

  // Refs for dropdown handling
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const paramOptionsDropdownRef = useRef<HTMLDivElement>(null);

  // Get current state as an object (for external save/restore)
  const getCurrentState = useCallback(
    (): LayoutSelectionState => ({
      searchQuery,
      showSearchDropdown,
      selectedLayoutIndex,
      isKeyboardNavigating,
      isEditingSearch,
      pendingLayout,
      pendingParams,
      currentParamIndex,
      parameterValues,
      paramInputValue,
      showingDefault,
      showParamOptionsDropdown,
      paramOptions,
      selectedParamOptionIndex,
      loadingLayoutInfo,
    }),
    [
      searchQuery,
      showSearchDropdown,
      selectedLayoutIndex,
      isKeyboardNavigating,
      isEditingSearch,
      pendingLayout,
      pendingParams,
      currentParamIndex,
      parameterValues,
      paramInputValue,
      showingDefault,
      showParamOptionsDropdown,
      paramOptions,
      selectedParamOptionIndex,
      loadingLayoutInfo,
    ]
  );

  // Save current state to cache for the given tab ID
  const saveStateToCache = useCallback(
    (tabId: string | null) => {
      if (!tabId) return;
      tabStateCache.current[tabId] = getCurrentState();
    },
    [getCurrentState]
  );

  // Restore state from cache for the given tab ID
  const restoreStateFromCache = useCallback((tabId: string | null) => {
    if (!tabId) {
      // Reset to defaults if no tabId
      setSearchQuery('');
      setShowSearchDropdown(false);
      setSelectedLayoutIndex(0);
      setIsKeyboardNavigating(false);
      setIsEditingSearch(false);
      setPendingLayout(null);
      setPendingParams([]);
      setCurrentParamIndex(0);
      setParameterValues({});
      setParamInputValue('');
      setShowingDefault(false);
      setShowParamOptionsDropdown(false);
      setParamOptions({});
      setSelectedParamOptionIndex(0);
      setLoadingLayoutInfo(null);
      return;
    }

    const cached = tabStateCache.current[tabId];
    if (cached) {
      setSearchQuery(cached.searchQuery);
      setShowSearchDropdown(cached.showSearchDropdown);
      setSelectedLayoutIndex(cached.selectedLayoutIndex);
      setIsKeyboardNavigating(cached.isKeyboardNavigating);
      setIsEditingSearch(cached.isEditingSearch);
      setPendingLayout(cached.pendingLayout);
      setPendingParams(cached.pendingParams);
      setCurrentParamIndex(cached.currentParamIndex);
      setParameterValues(cached.parameterValues);
      setParamInputValue(cached.paramInputValue);
      setShowingDefault(cached.showingDefault);
      setShowParamOptionsDropdown(cached.showParamOptionsDropdown);
      setParamOptions(cached.paramOptions);
      setSelectedParamOptionIndex(cached.selectedParamOptionIndex);
      setLoadingLayoutInfo(cached.loadingLayoutInfo);
    } else {
      // No cached state - reset to defaults
      setSearchQuery('');
      setShowSearchDropdown(false);
      setSelectedLayoutIndex(0);
      setIsKeyboardNavigating(false);
      setIsEditingSearch(false);
      setPendingLayout(null);
      setPendingParams([]);
      setCurrentParamIndex(0);
      setParameterValues({});
      setParamInputValue('');
      setShowingDefault(false);
      setShowParamOptionsDropdown(false);
      setParamOptions({});
      setSelectedParamOptionIndex(0);
      setLoadingLayoutInfo(null);
    }
  }, []);

  // Clear cache for a specific tab
  const clearCacheForTab = useCallback((tabId: string | null) => {
    if (tabId && tabStateCache.current[tabId]) {
      delete tabStateCache.current[tabId];
    }
  }, []);

  // Clean up cache when tabs are removed
  const cleanupCache = useCallback((currentTabs: Tab[]) => {
    const currentTabIds = new Set(currentTabs.map((t) => t.id));
    Object.keys(tabStateCache.current).forEach((cachedTabId) => {
      if (!currentTabIds.has(cachedTabId)) {
        delete tabStateCache.current[cachedTabId];
      }
    });
  }, []);

  // Get the previous tab ID ref (for external use)
  const getPreviousTabId = useCallback(() => previousTabIdRef.current, []);
  const setPreviousTabId = useCallback((tabId: string | null) => {
    previousTabIdRef.current = tabId;
  }, []);

  // Check if a layout requires parameters (has parameters without defaults)
  const layoutRequiresParams = useCallback(
    (layoutId: string): boolean => {
      const layout = registeredLayouts?.[layoutId];
      if (!layout?.parameters || layout.parameters.length === 0) {
        return false;
      }
      return layout.parameters.some((p) => !p.hasDefault);
    },
    [registeredLayouts]
  );

  // Get all parameters for a layout
  const getLayoutParams = useCallback(
    (layoutId: string): LayoutParameter[] => {
      const layout = registeredLayouts?.[layoutId];
      return layout?.parameters || [];
    },
    [registeredLayouts]
  );

  // Get parameter options for a layout (pre-defined configurations)
  const getLayoutParamOptions = useCallback(
    (layoutId: string): Record<string, ParameterOption> | null => {
      const layout = registeredLayouts?.[layoutId];
      return layout?.parameterOptions || null;
    },
    [registeredLayouts]
  );

  // Check if a layout is disabled (already open and allowMultiple=false)
  const isLayoutDisabled = useCallback(
    (layoutId: string): boolean => {
      const layoutMeta = registeredLayouts?.[layoutId];
      if (layoutMeta?.allowMultiple) return false;
      return tabs.some((tab) => tab.layoutId === layoutId && tab.id !== activeTabId);
    },
    [registeredLayouts, tabs, activeTabId]
  );

  // Get filtered layouts for search (memoized via callback)
  const getFilteredLayouts = useCallback((): LayoutWithId[] => {
    if (!registeredLayouts) return [];

    const allLayoutIds = Object.keys(registeredLayouts);
    const query = searchQuery.toLowerCase();

    return allLayoutIds
      .map((layoutId) => ({
        id: layoutId,
        ...registeredLayouts[layoutId],
      }))
      .filter((layout) => {
        if (!query) return true;
        const searchableText = [layout.name, layout.description, ...(layout.keywords || [])]
          .join(' ')
          .toLowerCase();
        return searchableText.includes(query);
      });
  }, [registeredLayouts, searchQuery]);

  // Get layouts to show in dropdown
  const getDropdownLayouts = useCallback((): LayoutWithId[] => {
    if (!registeredLayouts) return [];

    const query = searchQuery.toLowerCase();

    if (query) {
      return getFilteredLayouts();
    }

    const initialLayouts = searchBarConfig.displayedLayouts ?? displayedLayouts;

    if (!initialLayouts || initialLayouts.length === 0) {
      return [];
    }

    return initialLayouts
      .map((layoutId) => ({
        id: layoutId,
        ...registeredLayouts[layoutId],
      }))
      .filter((layout) => layout.name);
  }, [
    registeredLayouts,
    searchQuery,
    getFilteredLayouts,
    searchBarConfig.displayedLayouts,
    displayedLayouts,
  ]);

  // Get layouts for New Tab display cards
  const getDisplayedLayouts = useCallback((): LayoutWithId[] => {
    if (!registeredLayouts) return [];

    const layoutsToShow = displayedLayouts || Object.keys(registeredLayouts);

    return layoutsToShow
      .map((layoutId) => ({
        id: layoutId,
        ...registeredLayouts[layoutId],
      }))
      .filter((layout) => layout.name);
  }, [registeredLayouts, displayedLayouts]);

  // Apply the layout to the tab
  const applyLayoutToTab = useCallback(
    (layoutId: string, params: Record<string, string> = {}, optionKey: string | null = null) => {
      const layoutName = registeredLayouts[layoutId]?.name || 'Untitled';

      // Set loading info to show in search bar while layout loads
      if (Object.keys(params).length > 0 || optionKey) {
        setLoadingLayoutInfo({
          layoutName,
          params: Object.keys(params).length > 0 ? params : null,
          optionKey,
          pendingParams: pendingParams,
        });
      }

      // Update the tab's layout (only if we have an active tab)
      if (activeTabId) {
        updateTabLayout(
          activeTabId,
          layoutId,
          layoutName,
          Object.keys(params).length > 0 ? params : null,
          optionKey
        );
      }

      // Reset search state
      setSearchQuery('');
      setShowSearchDropdown(false);
      setSelectedLayoutIndex(0);
      setIsEditingSearch(false);

      // Reset parameter collection state
      setPendingLayout(null);
      setPendingParams([]);
      setCurrentParamIndex(0);
      setParameterValues({});
      setParamInputValue('');
      setShowingDefault(false);

      // Reset parameter options state
      setShowParamOptionsDropdown(false);
      setParamOptions({});
      setSelectedParamOptionIndex(0);
    },
    [activeTabId, registeredLayouts, pendingParams, updateTabLayout]
  );

  // Start parameter collection for a layout
  const startParamCollection = useCallback(
    (layoutId: string) => {
      // First check if layout has parameterOptions (pre-defined configurations)
      const options = getLayoutParamOptions(layoutId);
      if (options && Object.keys(options).length > 0) {
        setPendingLayout(layoutId);
        setParamOptions(options);
        setSelectedParamOptionIndex(0);
        setShowParamOptionsDropdown(true);
        paramOptionsJustOpened.current = true;
        setTimeout(() => {
          paramOptionsJustOpened.current = false;
        }, 100);
        setSearchQuery('');
        setShowSearchDropdown(false);
        return;
      }

      // No parameter options - proceed with normal parameter collection
      const params = getLayoutParams(layoutId);
      setPendingLayout(layoutId);
      setPendingParams(params);
      setCurrentParamIndex(0);
      setParameterValues({});

      // Set initial value (show default if available)
      const firstParam = params[0];
      if (firstParam?.hasDefault && firstParam.default !== null) {
        setParamInputValue(String(firstParam.default));
        setShowingDefault(true);
      } else {
        setParamInputValue('');
        setShowingDefault(false);
      }

      // Focus the search input
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          if (firstParam?.hasDefault) {
            searchInputRef.current.select();
          }
        }
      }, 50);
    },
    [getLayoutParams, getLayoutParamOptions]
  );

  // Cancel parameter collection
  const cancelParamCollection = useCallback(() => {
    setPendingLayout(null);
    setPendingParams([]);
    setCurrentParamIndex(0);
    setParameterValues({});
    setParamInputValue('');
    setShowingDefault(false);
    setSearchQuery('');
    setShowParamOptionsDropdown(false);
    setParamOptions({});
    setSelectedParamOptionIndex(0);
    setLoadingLayoutInfo(null);

    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 50);
  }, []);

  // Move to next parameter or finish
  const advanceToNextParam = useCallback(() => {
    const currentParam = pendingParams[currentParamIndex];
    const valueToSave =
      paramInputValue || (currentParam?.hasDefault ? String(currentParam.default) : '');

    const newValues = { ...parameterValues, [currentParam.name]: valueToSave };
    setParameterValues(newValues);

    if (currentParamIndex < pendingParams.length - 1) {
      const nextIndex = currentParamIndex + 1;
      setCurrentParamIndex(nextIndex);

      const nextParam = pendingParams[nextIndex];
      if (nextParam?.hasDefault && nextParam.default !== null) {
        setParamInputValue(String(nextParam.default));
        setShowingDefault(true);
      } else {
        setParamInputValue('');
        setShowingDefault(false);
      }

      setTimeout(() => {
        if (searchInputRef.current && nextParam?.hasDefault) {
          searchInputRef.current.select();
        }
      }, 10);
    } else {
      // All parameters collected - apply the layout
      applyLayoutToTab(pendingLayout!, newValues);
    }
  }, [
    pendingParams,
    currentParamIndex,
    paramInputValue,
    parameterValues,
    pendingLayout,
    applyLayoutToTab,
  ]);

  // Select a parameter option from the dropdown
  const selectParamOption = useCallback(
    (optionKey: string) => {
      if (!paramOptions[optionKey]) return;

      const option = paramOptions[optionKey];
      const params = option.params || {};

      applyLayoutToTab(pendingLayout!, params, optionKey);
    },
    [paramOptions, pendingLayout, applyLayoutToTab]
  );

  // Select a layout (for current tab)
  const selectLayout = useCallback(
    (layoutId: string) => {
      const params = getLayoutParams(layoutId);

      if (params.length > 0) {
        startParamCollection(layoutId);
      } else {
        applyLayoutToTab(layoutId);
      }

      setSearchQuery('');
      setShowSearchDropdown(false);
      setSelectedLayoutIndex(0);
    },
    [getLayoutParams, applyLayoutToTab, startParamCollection]
  );

  // Get current layout display info for search bar
  const getCurrentLayoutDisplayInfo = useCallback(
    (tab: Tab | null): LayoutDisplayInfo | null => {
      if (!tab || !tab.layoutId) return null;

      const layoutMeta = registeredLayouts?.[tab.layoutId];
      const layoutName = layoutMeta?.name || tab.layoutId;

      if (tab.layoutParamOptionKey) {
        return {
          type: 'option',
          layoutName,
          optionKey: tab.layoutParamOptionKey,
        };
      }

      if (tab.layoutParams && Object.keys(tab.layoutParams).length > 0) {
        const params = getLayoutParams(tab.layoutId);
        return {
          type: 'params',
          layoutName,
          params: tab.layoutParams as Record<string, string>,
          paramDefs: params,
        };
      }

      return {
        type: 'simple',
        layoutName,
      };
    },
    [registeredLayouts, getLayoutParams]
  );

  // Reset all layout selection state
  const resetLayoutSelection = useCallback(() => {
    setPendingLayout(null);
    setPendingParams([]);
    setCurrentParamIndex(0);
    setParameterValues({});
    setParamInputValue('');
    setShowingDefault(false);
    setSearchQuery('');
    setShowParamOptionsDropdown(false);
    setParamOptions({});
    setSelectedParamOptionIndex(0);
    setLoadingLayoutInfo(null);
    setIsEditingSearch(false);
  }, []);

  // Clear loading info (call when children are received)
  const clearLoadingInfo = useCallback(() => {
    setLoadingLayoutInfo(null);
  }, []);

  return {
    // Search state
    searchQuery,
    setSearchQuery,
    showSearchDropdown,
    setShowSearchDropdown,
    selectedLayoutIndex,
    setSelectedLayoutIndex,
    isKeyboardNavigating,
    setIsKeyboardNavigating,
    isEditingSearch,
    setIsEditingSearch,

    // Parameter state
    pendingLayout,
    pendingParams,
    currentParamIndex,
    parameterValues,
    paramInputValue,
    setParamInputValue,
    showingDefault,
    setShowingDefault,
    isCollectingParams: pendingLayout !== null && pendingParams.length > 0,

    // Parameter options state
    showParamOptionsDropdown,
    setShowParamOptionsDropdown,
    paramOptions,
    selectedParamOptionIndex,
    setSelectedParamOptionIndex,
    paramOptionsJustOpened,

    // Loading state
    loadingLayoutInfo,
    setLoadingLayoutInfo,
    clearLoadingInfo,

    // Refs
    searchInputRef,
    searchDropdownRef,
    paramOptionsDropdownRef,

    // Layout helpers
    layoutRequiresParams,
    getLayoutParams,
    getLayoutParamOptions,
    isLayoutDisabled,
    getFilteredLayouts,
    getDropdownLayouts,
    getDisplayedLayouts,
    getCurrentLayoutDisplayInfo,

    // Actions
    selectLayout,
    startParamCollection,
    cancelParamCollection,
    advanceToNextParam,
    selectParamOption,
    applyLayoutToTab,
    resetLayoutSelection,

    // Per-tab state management
    saveStateToCache,
    restoreStateFromCache,
    clearCacheForTab,
    cleanupCache,
    getCurrentState,
    getPreviousTabId,
    setPreviousTabId,
  };
}

export default useLayoutSelection;
