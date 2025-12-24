import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './KaleidoManager.css';
import SearchBar from './SearchBar';

// Extracted fragments
import InfoModal from '../modals/InfoModal';
import HelpModal from '../modals/HelpModal';
import NotificationArea from './NotificationArea';

// Modular components
import { TabBar, StatusBar, NewTabContent, LayoutWithIdProps } from './components';

// Custom hooks
import {
  useTabManagement,
  useKeyboardShortcuts,
  useLayoutSelection,
  useDashSync,
  useShareLinks,
} from '../hooks';

// Utilities
import { defaultSearchBarConfig, generateUUID } from '../utils';

// UI Components
import { Spinner } from '@/components/ui';

// Types
import type {
  Tab,
  LayoutMetadata,
  LayoutParameter,
  Notification,
  SetProps,
  LoadingState,
} from '@/types';

// ========== Types ==========
export interface SearchBarConfig {
  show?: boolean;
  placeholder?: string;
  position?: 'top' | 'under' | 'bottom';
  showDropdownInNewTab?: boolean;
  spawnLayoutInNewTab?: boolean;
  displayedLayouts?: string[] | null;
}

export interface KaleidoManagerProps {
  id: string;
  style?: React.CSSProperties;
  registeredLayouts?: Record<string, LayoutMetadata>;
  displayedLayouts?: string[] | null;
  initialTab?: Tab | null;
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  maxTabs?: number;
  contentOverflow?: 'auto' | 'hidden' | 'scroll' | 'visible';
  searchBarConfig?: SearchBarConfig;
  enableStatusBar?: boolean;
  persistence?: boolean | string | number;
  persisted_props?: ('activeTab' | 'tabs')[];
  persistence_type?: 'local' | 'session' | 'memory';
  loading_state?: LoadingState;
  setProps?: SetProps<KaleidoManagerProps>;
  activeTab?: string;
  tabs?: Tab[];
  children?: React.ReactNode;
  [key: `data-${string}`]: string | undefined;
}

interface StatusBarMode {
  name: string;
  description: string;
}

/**
 * KaleidoManager provides powerful layout and tab management for Dash applications.
 * It allows users to create, manage, and organize multiple tabs with different layouts.
 *
 * This version delegates to extracted hooks and components for better modularity.
 */
const KaleidoManager: React.FC<KaleidoManagerProps> = (props) => {
  const {
    id,
    style,
    registeredLayouts = {},
    displayedLayouts = null,
    initialTab = null,
    theme = 'light',
    size = 'md',
    maxTabs = -1,
    contentOverflow = 'auto',
    searchBarConfig: userSearchBarConfig = {},
    enableStatusBar = false,
    persistence = false,
    loading_state,
    setProps,
    activeTab: controlledActiveTab,
    tabs: controlledTabs,
    children,
    ...otherProps
  } = props;

  // Merge user config with defaults
  const searchBarConfig = {
    ...defaultSearchBarConfig,
    ...userSearchBarConfig,
  };

  // Extract data-* attributes to pass to root element
  const dataAttributes = Object.keys(otherProps)
    .filter((key) => key.startsWith('data-'))
    .reduce<Record<string, string | undefined>>(
      (acc, key) => ({ ...acc, [key]: (otherProps as Record<string, string | undefined>)[key] }),
      {}
    );

  // UUID generator (memoized)
  const generateUUIDCallback = useCallback(() => generateUUID(), []);

  // ========== NOTIFICATION STATE ==========
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationHistory, setShowNotificationHistory] = useState<boolean>(false);

  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [...prev, notification]);

    if (type === 'success') {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 3000);
    }
  }, []);

  // ========== LAYOUT SELECTION HOOK ==========
  const layoutSelection = useLayoutSelection({
    registeredLayouts,
    displayedLayouts,
    searchBarConfig,
    activeTabId: null, // Will be set after tab management hook
    updateTabLayout: () => {}, // Will be set after tab management hook
    tabs: [], // Will be updated
  });

  // ========== TAB MANAGEMENT HOOK ==========
  const tabManagement = useTabManagement({
    generateUUID: generateUUIDCallback,
    maxTabs,
    registeredLayouts,
    initialTabs: controlledTabs,
    initialTab: initialTab?.layoutId ?? null,
    onResetLayoutSelection: layoutSelection.resetLayoutSelection,
  });

  // ========== DASH SYNC HOOK ==========
  const dashSync = useDashSync({
    tabs: tabManagement.tabs,
    activeTabId: tabManagement.activeTabId,
    controlledTabs,
    controlledActiveTab,
    persistence,
    setProps: setProps as ((props: Record<string, unknown>) => void) | undefined,
    setTabs: tabManagement.setTabs,
    setActiveTabId: tabManagement.setActiveTabId,
  });

  // ========== SHARE LINKS HOOK ==========
  const shareLinks = useShareLinks({
    tabs: tabManagement.tabs,
    registeredLayouts,
    maxTabs,
    generateUUID: generateUUIDCallback,
    setTabs: tabManagement.setTabs,
    setActiveTabId: tabManagement.setActiveTabId,
    addNotification,
  });

  // ========== MODAL STATE ==========
  const [modalTab, setModalTab] = useState<Tab | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Refs
  const tabBarRef = useRef<HTMLDivElement>(null);
  const childrenCache = useRef<Record<string, React.ReactNode>>({});

  // ========== DERIVED STATE ==========
  const activeTab = tabManagement.activeTab;
  const isNewTab = activeTab && (!activeTab.layoutId || activeTab.layoutId === null);
  const shouldShowSearchBar = isNewTab || searchBarConfig.show;
  const isDashLoading = loading_state?.is_loading;

  // Check if a layout is disabled (already open and allowMultiple=false)
  const isLayoutDisabled = useCallback(
    (layoutId: string): boolean => {
      const layoutMeta = registeredLayouts?.[layoutId];
      // If allowMultiple is true, layout is never disabled
      if (layoutMeta?.allowMultiple) return false;
      // Disabled if any OTHER tab has this layout
      return tabManagement.tabs.some(
        (tab) => tab.layoutId === layoutId && tab.id !== tabManagement.activeTabId
      );
    },
    [registeredLayouts, tabManagement.tabs, tabManagement.activeTabId]
  );

  // ========== INFO MODAL HANDLER (needed before keyboard shortcuts) ==========
  const handleInfo = useCallback((tab: Tab) => {
    if (!tab) return;
    setModalTab(tab);
    setShowInfoModal(true);
  }, []);

  // ========== KEYBOARD SHORTCUTS HOOK ==========
  useKeyboardShortcuts({
    tabs: tabManagement.tabs,
    activeTabId: tabManagement.activeTabId,
    addTab: tabManagement.addTab,
    removeTab: tabManagement.removeTab,
    selectTab: tabManagement.selectTab,
    lockTab: (tabId: string) => tabManagement.lockTab(tabId),
    unlockTab: (tabId: string) => tabManagement.unlockTab(tabId),
    startRename: tabManagement.startRename,
    showInfo: handleInfo,
    searchInputRef: layoutSelection.searchInputRef,
    shouldShowSearchBar: !!shouldShowSearchBar,
    showSearchDropdown: layoutSelection.showSearchDropdown,
    setShowHelpModal,
  });

  // ========== CONTEXT MENU HANDLERS ==========
  const handleRename = useCallback(
    (tab: Tab) => {
      if (!tab || tab.locked) return;
      tabManagement.startRename(tab);
    },
    [tabManagement]
  );

  const handleLockTab = useCallback(
    (tab: Tab) => {
      if (!tab || !tab.layoutId) return;
      tabManagement.lockTab(tab.id);
    },
    [tabManagement]
  );

  const handleUnlockTab = useCallback(
    (tab: Tab) => {
      if (!tab) return;
      tabManagement.unlockTab(tab.id);
    },
    [tabManagement]
  );

  // ========== CACHE MANAGEMENT ==========
  // Cache children for each tab
  useEffect(() => {
    if (activeTab && activeTab.layoutId && children) {
      childrenCache.current[tabManagement.activeTabId!] = children;
      if (layoutSelection.loadingLayoutInfo) {
        layoutSelection.clearLoadingInfo();
      }
    }
  }, [
    children,
    tabManagement.activeTabId,
    activeTab,
    layoutSelection.loadingLayoutInfo,
    layoutSelection,
  ]);

  // Clean up cache when tabs are removed
  useEffect(() => {
    const tabIds = new Set(tabManagement.tabs.map((t) => t.id));
    Object.keys(childrenCache.current).forEach((cachedId) => {
      if (!tabIds.has(cachedId)) {
        delete childrenCache.current[cachedId];
      }
    });
    // Also cleanup searchbar state cache for removed tabs
    layoutSelection.cleanupCache(tabManagement.tabs);
  }, [tabManagement.tabs, layoutSelection]);

  // ========== PER-TAB SEARCHBAR STATE MANAGEMENT ==========
  useEffect(() => {
    const previousTabId = layoutSelection.getPreviousTabId();
    const currentTabId = tabManagement.activeTabId;

    // Skip if no real tab change
    if (!currentTabId || previousTabId === currentTabId) {
      return;
    }

    // Save state from previous tab if it was a "New Tab" (no layout)
    if (previousTabId) {
      const previousTab = tabManagement.tabs.find((t) => t.id === previousTabId);
      if (previousTab && !previousTab.layoutId) {
        layoutSelection.saveStateToCache(previousTabId);
      }
    }

    // Restore state for current tab if it's a "New Tab" (no layout)
    const currentTab = tabManagement.tabs.find((t) => t.id === currentTabId);
    if (currentTab && !currentTab.layoutId) {
      layoutSelection.restoreStateFromCache(currentTabId);
    } else {
      // If switching to a tab with a layout, reset the searchbar
      layoutSelection.resetLayoutSelection();
    }

    // Update previous tab tracker
    layoutSelection.setPreviousTabId(currentTabId);
  }, [tabManagement.activeTabId, tabManagement.tabs, layoutSelection]);

  // ========== LOADING TABS COMPUTATION ==========
  const loadingTabsSet = useMemo(() => {
    if (!isDashLoading) return new Set<string>();

    const tabsWithLayouts = tabManagement.tabs.filter((t) => t.layoutId);
    if (tabsWithLayouts.length === 0) return new Set<string>();

    const renderedTabIds = new Set<string>();
    if (children) {
      const childArray = React.Children.toArray(children);
      childArray.forEach((child) => {
        if (!React.isValidElement(child)) return;
        let childProps = child.props || {};
        if (
          (child.props as { componentPath?: string[] })?.componentPath &&
          window.dash_component_api?.getLayout
        ) {
          try {
            childProps =
              window.dash_component_api.getLayout([
                ...(child.props as { componentPath: string[] }).componentPath,
                'props',
              ]) || childProps;
          } catch (e) {
            /* ignore */
          }
        }
        const childId = childProps.id;
        let tabId: string | null = null;
        if (typeof childId === 'object' && childId !== null) {
          const fullIndex = childId.index;
          tabId =
            typeof fullIndex === 'string' && fullIndex.includes(':')
              ? fullIndex.split(':')[0]
              : fullIndex;
        } else if (typeof childId === 'string') {
          try {
            const parsed = JSON.parse(childId);
            tabId =
              typeof parsed.index === 'string' && parsed.index.includes(':')
                ? parsed.index.split(':')[0]
                : parsed.index;
          } catch {
            tabId =
              typeof childId === 'string' && childId.includes(':')
                ? childId.split(':')[0]
                : childId;
          }
        }
        if (tabId) renderedTabIds.add(tabId);
      });
    }

    const loading = new Set<string>();
    tabsWithLayouts.forEach((tab) => {
      if (!renderedTabIds.has(tab.id)) {
        loading.add(tab.id);
      }
    });
    return loading;
  }, [tabManagement.tabs, children, isDashLoading]);

  // ========== STATUS BAR MODE ==========
  const getCurrentMode = useCallback((): StatusBarMode => {
    if (layoutSelection.showParamOptionsDropdown) {
      return {
        name: 'Options',
        description: 'Selecting from parameter options',
      };
    }
    if (layoutSelection.isCollectingParams) {
      const currentParam = layoutSelection.pendingParams[layoutSelection.currentParamIndex];
      return {
        name: `Param (${currentParam?.name || '...'})`,
        description: `Entering value for parameter '${currentParam?.name || '...'}'`,
      };
    }
    if (activeTab?.layoutId) {
      if (layoutSelection.isEditingSearch) {
        return { name: 'Search', description: 'Searching for layouts' };
      }
      return { name: 'Display', description: 'Viewing selected layout' };
    }
    return { name: 'Search', description: 'Browsing available layouts' };
  }, [
    layoutSelection.showParamOptionsDropdown,
    layoutSelection.isCollectingParams,
    layoutSelection.pendingParams,
    layoutSelection.currentParamIndex,
    layoutSelection.isEditingSearch,
    activeTab,
  ]);

  // ========== LAYOUT SELECTION WITH TAB UPDATE ==========
  const handleSelectLayout = useCallback(
    (layoutId: string) => {
      const params = layoutSelection.getLayoutParams(layoutId);

      if (params.length > 0) {
        layoutSelection.startParamCollection(layoutId);
      } else {
        const layoutName = registeredLayouts[layoutId]?.name || 'Untitled';
        tabManagement.updateTabLayout(tabManagement.activeTabId!, layoutId, layoutName);
        layoutSelection.resetLayoutSelection();
      }
    },
    [layoutSelection, tabManagement, registeredLayouts]
  );

  // Handle applying layout with params
  const handleApplyLayoutToTab = useCallback(
    (layoutId: string, params: Record<string, string> = {}, optionKey: string | null = null) => {
      const layoutName = registeredLayouts[layoutId]?.name || 'Untitled';

      if (Object.keys(params).length > 0 || optionKey) {
        layoutSelection.setLoadingLayoutInfo({
          layoutName,
          params: Object.keys(params).length > 0 ? params : null,
          optionKey,
          pendingParams: layoutSelection.pendingParams,
        });
      }

      tabManagement.updateTabLayout(
        tabManagement.activeTabId!,
        layoutId,
        layoutName,
        Object.keys(params).length > 0 ? params : undefined,
        optionKey || undefined
      );

      layoutSelection.resetLayoutSelection();
    },
    [layoutSelection, tabManagement, registeredLayouts]
  );

  // ========== RENDER TAB CONTENTS ==========
  const renderTabContents = (): React.ReactNode => {
    if (!children) return null;

    const childArray = React.Children.toArray(children);
    if (childArray.length === 0) return null;

    return childArray.map((child, index) => {
      if (!React.isValidElement(child)) return child;

      let childProps = child.props || {};
      if (
        (child.props as { componentPath?: string[] })?.componentPath &&
        window.dash_component_api?.getLayout
      ) {
        try {
          childProps =
            window.dash_component_api.getLayout([
              ...(child.props as { componentPath: string[] }).componentPath,
              'props',
            ]) || childProps;
        } catch (e) {
          /* ignore */
        }
      }

      const childId = childProps.id;
      let tabId: string | null = null;
      let fullIndex: string | null = null;

      if (typeof childId === 'object' && childId !== null) {
        fullIndex = childId.index;
        tabId =
          typeof fullIndex === 'string' && fullIndex.includes(':')
            ? fullIndex.split(':')[0]
            : fullIndex;
      } else if (typeof childId === 'string') {
        try {
          const parsed = JSON.parse(childId);
          fullIndex = parsed.index;
          tabId =
            typeof fullIndex === 'string' && fullIndex.includes(':')
              ? fullIndex.split(':')[0]
              : fullIndex;
        } catch {
          fullIndex = childId;
          tabId =
            typeof childId === 'string' && childId.includes(':') ? childId.split(':')[0] : childId;
        }
      }

      const isVisible = tabId === tabManagement.activeTabId;

      return (
        <div
          key={fullIndex || index}
          style={{
            visibility: isVisible ? 'visible' : 'hidden',
            position: isVisible ? 'relative' : 'absolute',
            pointerEvents: isVisible ? 'auto' : 'none',
            overflow: contentOverflow,
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
          }}
        >
          {child}
        </div>
      );
    });
  };

  // ========== RENDER ALL TABS ==========
  const renderAllTabs = (): React.ReactNode => {
    // New Tab panels
    const newTabPanels = tabManagement.tabs
      .filter((tab) => !tab.layoutId || tab.layoutId === null)
      .map((tab) => {
        const isActive = tab.id === tabManagement.activeTabId;
        if (!isActive) return null;

        const filteredLayouts = layoutSelection.getFilteredLayouts();
        const cardsToShow = layoutSelection.searchQuery
          ? filteredLayouts
          : layoutSelection.getDisplayedLayouts();
        const shouldHighlightCards = !searchBarConfig.showDropdownInNewTab;

        return (
          <div key={tab.id}>
            <NewTabContent
              layouts={cardsToShow as LayoutWithIdProps[]}
              selectedIndex={layoutSelection.selectedLayoutIndex}
              highlightCards={shouldHighlightCards}
              isLayoutDisabled={isLayoutDisabled}
              onLayoutSelect={handleSelectLayout}
              theme={theme}
              size={size}
            />
          </div>
        );
      })
      .filter(Boolean);

    // Loading panels
    const loadingPanels = tabManagement.tabs
      .filter((tab) => tab.layoutId && loadingTabsSet.has(tab.id))
      .map((tab) => {
        const isActive = tab.id === tabManagement.activeTabId;
        const layoutInfo = registeredLayouts?.[tab.layoutId!];
        return (
          <div
            key={`loading-${tab.id}`}
            style={{
              display: isActive ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '200px',
            }}
          >
            <div
              className={['flex flex-col items-center gap-4', 'text-secondary']
                .filter(Boolean)
                .join(' ')}
            >
              <Spinner size="lg" />
              <span className="text-sm animate-pulse">
                Loading {layoutInfo?.name || tab.layoutId}...
              </span>
            </div>
          </div>
        );
      });

    // Layout tab panels
    const layoutTabPanels = renderTabContents();

    return (
      <>
        {newTabPanels}
        {loadingPanels}
        {layoutTabPanels}
      </>
    );
  };

  // ========== RENDER SEARCH BAR ==========
  const renderSearchBar = (): React.ReactNode => {
    if (!shouldShowSearchBar) return null;

    const isTabLocked = activeTab?.locked === true;
    const filteredLayouts = layoutSelection.getFilteredLayouts();
    const dropdownLayouts = layoutSelection.getDropdownLayouts();
    const useDropdown = !isNewTab || searchBarConfig.showDropdownInNewTab;

    // Determine search bar mode
    let searchBarMode: 'search' | 'loading' | 'paramOptions' | 'params' | 'display' = 'search';
    if (layoutSelection.loadingLayoutInfo) {
      searchBarMode = 'loading';
    } else if (layoutSelection.showParamOptionsDropdown && layoutSelection.pendingLayout) {
      searchBarMode = 'paramOptions';
    } else if (layoutSelection.isCollectingParams) {
      searchBarMode = 'params';
    } else if (!isNewTab && !layoutSelection.isEditingSearch && !isTabLocked) {
      const currentLayoutInfo = layoutSelection.getCurrentLayoutDisplayInfo(activeTab);
      if (currentLayoutInfo) {
        searchBarMode = 'display';
      }
    }

    return (
      <SearchBar
        mode={searchBarMode}
        placeholder={searchBarConfig.placeholder}
        useDropdown={useDropdown}
        isNewTab={!!isNewTab}
        searchQuery={layoutSelection.searchQuery}
        onSearchChange={layoutSelection.setSearchQuery}
        showDropdown={layoutSelection.showSearchDropdown}
        onDropdownVisibilityChange={layoutSelection.setShowSearchDropdown}
        filteredLayouts={useDropdown ? dropdownLayouts : filteredLayouts}
        selectedIndex={layoutSelection.selectedLayoutIndex}
        onSelectedIndexChange={layoutSelection.setSelectedLayoutIndex}
        isKeyboardNavigating={layoutSelection.isKeyboardNavigating}
        onKeyboardNavigatingChange={layoutSelection.setIsKeyboardNavigating}
        currentLayoutInfo={layoutSelection.getCurrentLayoutDisplayInfo(activeTab)}
        isTabLocked={isTabLocked}
        pendingLayout={layoutSelection.pendingLayout}
        pendingLayoutName={registeredLayouts[layoutSelection.pendingLayout || '']?.name || ''}
        pendingParams={layoutSelection.pendingParams}
        currentParamIndex={layoutSelection.currentParamIndex}
        paramInputValue={layoutSelection.paramInputValue}
        onParamInputChange={layoutSelection.setParamInputValue}
        showingDefault={layoutSelection.showingDefault}
        onShowingDefaultChange={layoutSelection.setShowingDefault}
        paramOptions={layoutSelection.paramOptions}
        selectedParamOptionIndex={layoutSelection.selectedParamOptionIndex}
        onParamOptionIndexChange={layoutSelection.setSelectedParamOptionIndex}
        loadingLayoutInfo={layoutSelection.loadingLayoutInfo}
        registeredLayouts={registeredLayouts}
        onLayoutSelect={handleSelectLayout}
        onLayoutSelectInNewTab={(layoutId: string) => {
          // Create new tab and select layout
          const newTab = tabManagement.addTab();
          if (newTab) {
            setTimeout(() => handleSelectLayout(layoutId), 50);
          }
        }}
        onParamAdvance={() => {
          const currentParam = layoutSelection.pendingParams[layoutSelection.currentParamIndex];
          const valueToSave =
            layoutSelection.paramInputValue ||
            (currentParam?.hasDefault ? String(currentParam.default) : '');

          const newValues = {
            ...layoutSelection.parameterValues,
            [currentParam.name]: valueToSave,
          };

          if (layoutSelection.currentParamIndex < layoutSelection.pendingParams.length - 1) {
            layoutSelection.advanceToNextParam();
          } else {
            handleApplyLayoutToTab(layoutSelection.pendingLayout!, newValues);
          }
        }}
        onParamCancel={layoutSelection.cancelParamCollection}
        onParamOptionSelect={(key: string) => {
          const option = layoutSelection.paramOptions[key];
          if (option) {
            handleApplyLayoutToTab(layoutSelection.pendingLayout!, option.params || {}, key);
          }
        }}
        onEditingStart={() => layoutSelection.setIsEditingSearch(true)}
        onEditingEnd={() => {
          layoutSelection.setIsEditingSearch(false);
          layoutSelection.setSearchQuery('');
        }}
        isLayoutDisabled={isLayoutDisabled}
        inputRef={layoutSelection.searchInputRef}
        dropdownRef={layoutSelection.searchDropdownRef}
        paramOptionsDropdownRef={layoutSelection.paramOptionsDropdownRef}
      />
    );
  };

  // ========== MAIN RENDER ==========
  const idString = typeof id === 'object' ? JSON.stringify(id) : id;

  return (
    <div
      id={idString}
      className={[
        'kaleido-container flex flex-col h-full w-full',
        `kaleido-theme-${theme} kaleido-size-${size}`,
        isDashLoading && 'opacity-50 pointer-events-none',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      data-dash-is-loading={isDashLoading || undefined}
      {...dataAttributes}
    >
      {/* Search Bar - top position */}
      {searchBarConfig.position === 'top' && renderSearchBar()}

      {/* Tab Bar */}
      <TabBar
        tabs={tabManagement.tabs}
        activeTabId={tabManagement.activeTabId}
        registeredLayouts={registeredLayouts}
        canCloseTabs={true}
        showContextMenu={true}
        tabBarRef={tabBarRef}
        onTabClick={tabManagement.selectTab}
        onTabClose={tabManagement.removeTab}
        onTabRename={(tabId: string, newName: string) => {
          // Find the tab and rename it
          const tab = tabManagement.tabs.find((t) => t.id === tabId);
          if (tab) {
            tabManagement.renameTab(tabId, newName);
          }
        }}
        onTabLock={(tabId: string, locked: boolean) => {
          if (locked) {
            tabManagement.lockTab(tabId);
          } else {
            tabManagement.unlockTab(tabId);
          }
        }}
        onTabPin={(tabId: string, pinned: boolean) => {
          tabManagement.pinTab(tabId, pinned);
        }}
        onTabDuplicate={(tabId: string) => {
          tabManagement.duplicateTab(tabId);
        }}
        onTabInfo={handleInfo}
        onTabsReorder={tabManagement.setTabs}
        onNewTab={tabManagement.addTab}
        onShowHelp={() => setShowHelpModal(true)}
        maxTabs={maxTabs}
      />

      {/* Search Bar - under position (default) */}
      {searchBarConfig.position === 'under' && renderSearchBar()}

      {/* Tab Content */}
      <div className="flex-1 overflow-auto bg-background">{renderAllTabs()}</div>

      {/* Search Bar - bottom position */}
      {searchBarConfig.position === 'bottom' && renderSearchBar()}

      {/* Status Bar */}
      <StatusBar
        enabled={enableStatusBar}
        tabs={tabManagement.tabs}
        activeTab={activeTab}
        registeredLayouts={registeredLayouts}
        maxTabs={maxTabs}
        lastSyncTime={dashSync.lastSyncTime}
        currentMode={getCurrentMode()}
        searchInputRef={layoutSelection.searchInputRef}
        notifications={notifications}
        setNotifications={setNotifications}
        showNotificationHistory={showNotificationHistory}
        setShowNotificationHistory={setShowNotificationHistory}
      />

      {/* Info Modal */}
      <InfoModal open={showInfoModal} onOpenChange={setShowInfoModal} tab={modalTab} />

      {/* Help Modal */}
      <HelpModal open={showHelpModal} onOpenChange={setShowHelpModal} version="0.0.1" />

      {/* Notification Area */}
      <NotificationArea
        notifications={notifications}
        setNotifications={setNotifications}
        showHistory={showNotificationHistory}
        setShowHistory={setShowNotificationHistory}
      />
    </div>
  );
};

export default KaleidoManager;
