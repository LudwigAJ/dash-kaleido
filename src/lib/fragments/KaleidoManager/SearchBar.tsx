import React, { useRef, useEffect } from 'react';
import { Command } from 'cmdk';
import type { LayoutMetadata, LayoutParameter } from '@/types';
import type { LayoutDisplayInfo, LoadingLayoutInfo, LayoutWithId, ParameterOption } from '@/fragments/hooks/types';

export type SearchBarMode = 'display' | 'search' | 'params' | 'paramOptions' | 'loading';

export interface KaleidoSearchBarProps {
  // Mode
  mode?: SearchBarMode;

  // Configuration
  placeholder?: string;
  useDropdown?: boolean;
  isNewTab?: boolean;

  // State - Search mode
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showDropdown?: boolean;
  onDropdownVisibilityChange?: (visible: boolean) => void;
  filteredLayouts?: LayoutWithId[];
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
  isKeyboardNavigating?: boolean;
  onKeyboardNavigatingChange?: (navigating: boolean) => void;

  // State - Display mode
  currentLayoutInfo?: LayoutDisplayInfo | null;
  isTabLocked?: boolean;

  // State - Parameter collection mode
  pendingLayout?: string | null;
  pendingLayoutName?: string;
  pendingParams?: LayoutParameter[];
  currentParamIndex?: number;
  paramInputValue?: string;
  onParamInputChange?: (value: string) => void;
  showingDefault?: boolean;
  onShowingDefaultChange?: (showing: boolean) => void;

  // State - Parameter options mode
  paramOptions?: Record<string, ParameterOption>;
  selectedParamOptionIndex?: number;
  onParamOptionIndexChange?: (index: number) => void;

  // State - Loading mode
  loadingLayoutInfo?: LoadingLayoutInfo | null;

  // Layout metadata
  registeredLayouts?: Record<string, LayoutMetadata>;

  // Callbacks
  onLayoutSelect?: (layoutId: string) => void;
  onLayoutSelectInNewTab?: (layoutId: string) => void;
  onParamAdvance?: () => void;
  onParamCancel?: () => void;
  onParamOptionSelect?: (optionKey: string) => void;
  onEditingStart?: () => void;
  onEditingEnd?: () => void;
  onSearchKeyDown?: (e: React.KeyboardEvent) => void;
  isLayoutDisabled?: (layoutId: string) => boolean;

  // Refs (optional, component creates its own if not provided)
  inputRef?: React.RefObject<HTMLInputElement>;
  dropdownRef?: React.RefObject<HTMLDivElement>;
  paramOptionsDropdownRef?: React.RefObject<HTMLDivElement>;
}

/**
 * KaleidoSearchBar - A search bar component with multiple modes.
 *
 * Modes:
 * - display: Shows current layout info (read-only, clickable to edit)
 * - search: Active search input with optional dropdown
 * - params: Collecting individual parameters for a layout
 * - paramOptions: Dropdown for pre-defined parameter configurations
 * - loading: Shows layout name + params while loading
 */
const KaleidoSearchBar: React.FC<KaleidoSearchBarProps> = ({
  // Mode
  mode = 'search',

  // Configuration
  placeholder = 'Search layouts...',
  useDropdown = false,
  isNewTab = true,

  // State - Search mode
  searchQuery = '',
  onSearchChange,
  showDropdown = false,
  onDropdownVisibilityChange,
  filteredLayouts = [],
  selectedIndex = 0,
  onSelectedIndexChange,
  isKeyboardNavigating = false,
  onKeyboardNavigatingChange,

  // State - Display mode
  currentLayoutInfo = null,
  isTabLocked = false,

  // State - Parameter collection mode
  pendingLayout = null,
  pendingLayoutName = '',
  pendingParams = [],
  currentParamIndex = 0,
  paramInputValue = '',
  onParamInputChange,
  showingDefault = false,
  onShowingDefaultChange,

  // State - Parameter options mode
  paramOptions = {},
  selectedParamOptionIndex = 0,
  onParamOptionIndexChange,

  // State - Loading mode
  loadingLayoutInfo = null,

  // Layout metadata
  registeredLayouts = {},

  // Callbacks
  onLayoutSelect,
  onLayoutSelectInNewTab,
  onParamAdvance,
  onParamCancel,
  onParamOptionSelect,
  onEditingStart,
  onEditingEnd,
  onSearchKeyDown,
  isLayoutDisabled,

  // Refs (optional, component creates its own if not provided)
  inputRef: externalInputRef,
  dropdownRef: externalDropdownRef,
  paramOptionsDropdownRef: externalParamOptionsRef,
}) => {
  // Create internal refs if external ones aren't provided
  const internalInputRef = useRef<HTMLInputElement>(null);
  const internalDropdownRef = useRef<HTMLDivElement>(null);
  const internalParamOptionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const inputRef = externalInputRef || internalInputRef;
  const dropdownRef = externalDropdownRef || internalDropdownRef;
  const paramOptionsDropdownRef = externalParamOptionsRef || internalParamOptionsRef;

  // Focus input when switching to edit mode
  useEffect(() => {
    if (mode === 'search' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode, inputRef]);

  // Click outside handler to close dropdown
  useEffect(() => {
    if (!showDropdown || !useDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is outside the search bar container
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onDropdownVisibilityChange?.(false);
      }
    };

    // Use mousedown to catch clicks before blur
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, useDropdown, onDropdownVisibilityChange]);

  // Handle input changes for parameter mode
  const handleParamInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // If showing default and user types/backspaces, clear default mode
    if (showingDefault) {
      onShowingDefaultChange?.(false);
      // If backspace on default, clear the value
      if (value.length < paramInputValue.length) {
        onParamInputChange?.('');
        return;
      }
    }
    onParamInputChange?.(value);
  };

  // Handle keydown for parameter mode
  const handleParamKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentParam = pendingParams[currentParamIndex];

    if (e.key === 'Enter') {
      e.preventDefault();
      // Check if required param is empty
      if (!currentParam?.hasDefault && !paramInputValue.trim()) {
        // Required param can't be empty - don't advance
        return;
      }
      onParamAdvance?.();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onParamCancel?.();
    } else if (e.key === 'Backspace' && showingDefault) {
      // Backspace while showing default - clear the value
      e.preventDefault();
      onShowingDefaultChange?.(false);
      onParamInputChange?.('');
    }
  };

  // Handle keydown to start editing when user presses any key while displaying layout
  const handleDisplayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isTabLocked) return;

    // Allow printable characters to start editing
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      onEditingStart?.();
      onSearchChange?.(e.key);
      e.preventDefault();
    } else if (e.key === 'Backspace') {
      onEditingStart?.();
      onSearchChange?.('');
      e.preventDefault();
    }
  };

  // Handle input focus - show dropdown (always when useDropdown is true)
  const handleSearchInputFocus = () => {
    if (isTabLocked) return;
    if (useDropdown) {
      onDropdownVisibilityChange?.(true);
    }
  };

  // Handle input blur - revert to display mode if in layout, close dropdown
  const handleSearchInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if the blur is to an element inside the command/dropdown
    // If so, don't close (user might be clicking a dropdown item)
    const relatedTarget = e.relatedTarget;
    const commandEl = e.currentTarget?.closest('.kaleido-command');

    // If clicking inside the command component (dropdown), don't close
    if (relatedTarget && commandEl?.contains(relatedTarget)) {
      return;
    }

    // Small delay to allow click events on dropdown items to fire first
    setTimeout(() => {
      if (useDropdown) {
        onDropdownVisibilityChange?.(false);
      }
      if (!isNewTab && mode === 'search') {
        onEditingEnd?.();
      }
    }, 150);
  };

  // Render loading state
  if (mode === 'loading' && loadingLayoutInfo) {
    const {
      layoutName,
      params,
      optionKey,
      pendingParams: loadingParams,
    } = loadingLayoutInfo;

    return (
      <div className="kaleido-search-bar">
        <span className="kaleido-search-prompt">{layoutName}</span>
        <span className="kaleido-param-separator">&gt;</span>
        {optionKey ? (
          <span className="kaleido-search-prompt">{optionKey}</span>
        ) : params ? (
          <>
            {loadingParams &&
              loadingParams.map((param, idx) => (
                <React.Fragment key={param.name}>
                  <span className="kaleido-search-prompt">
                    ?{param.name}
                  </span>
                  <span className="kaleido-param-separator">&gt;</span>
                  <span className="kaleido-search-prompt">
                    {params[param.name] || ''}
                  </span>
                  {idx < loadingParams.length - 1 && (
                    <span className="kaleido-param-separator">&gt;</span>
                  )}
                </React.Fragment>
              ))}
          </>
        ) : null}
      </div>
    );
  }

  // Render parameter collection mode
  if (mode === 'params' && pendingParams.length > 0) {
    const currentParam = pendingParams[currentParamIndex];
    const hasDefault =
      currentParam?.hasDefault && currentParam?.default !== null;

    return (
      <div className="kaleido-search-bar">
        <span className="kaleido-search-prompt">{pendingLayoutName}</span>
        <span className="kaleido-param-separator">&gt;</span>
        <span className="kaleido-search-prompt">?{currentParam?.name}</span>
        <span className="kaleido-param-separator">&gt;</span>
        <input
          ref={inputRef}
          type="text"
          className={`kaleido-search-input kaleido-param-input ${showingDefault ? 'showing-default' : ''}`}
          placeholder={hasDefault ? '' : 'required'}
          value={paramInputValue}
          onChange={handleParamInputChange}
          onKeyDown={handleParamKeyDown}
          autoFocus
        />
        <span className="kaleido-param-hint">
          {currentParamIndex + 1}/{pendingParams.length}
          {hasDefault && !paramInputValue && (
            <span className="kaleido-param-default-hint">
              {' '}
              (Enter for default)
            </span>
          )}
        </span>
        <button
          className="kaleido-param-cancel-btn"
          onClick={onParamCancel}
          title="Cancel (Esc)"
        >
          ×
        </button>
      </div>
    );
  }

  // Render parameter options mode - using cmdk for keyboard navigation
  if (
    mode === 'paramOptions' &&
    pendingLayout &&
    Object.keys(paramOptions).length > 0
  ) {
    const optionEntries = Object.entries(paramOptions);

    return (
      <div className="kaleido-search-bar">
        <span className="kaleido-search-prompt">{pendingLayoutName}</span>
        <span className="kaleido-param-separator">&gt;</span>
        <div className="kaleido-param-options-spacer"></div>
        <button
          className="kaleido-param-cancel-btn"
          onClick={onParamCancel}
          title="Cancel (Esc)"
        >
          ×
        </button>
        <Command className="kaleido-command kaleido-param-options-command" loop>
          <Command.List
            ref={paramOptionsDropdownRef}
            className="kaleido-search-dropdown kaleido-param-options-dropdown"
          >
            {optionEntries.map(([key, option]) => (
              <Command.Item
                key={key}
                value={key}
                onSelect={() => onParamOptionSelect?.(key)}
                className="kaleido-search-dropdown-item"
              >
                <span className="kaleido-dropdown-name">{key}</span>
                <span className="kaleido-dropdown-description">
                  {option.description}
                </span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    );
  }

  // Render display mode
  if (mode === 'display' && currentLayoutInfo && !isTabLocked) {
    return (
      <div
        className="kaleido-search-bar kaleido-layout-display"
        tabIndex={0}
        onKeyDown={handleDisplayKeyDown}
        onClick={() => {
          onEditingStart?.();
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <span className="kaleido-layout-name">
          {currentLayoutInfo.layoutName}
        </span>
        {currentLayoutInfo.type === 'option' && (
          <>
            <span className="kaleido-param-separator">&gt;</span>
            <span className="kaleido-layout-param">
              {currentLayoutInfo.optionKey}
            </span>
          </>
        )}
        {currentLayoutInfo.type === 'params' &&
          currentLayoutInfo.paramDefs?.map((param) => (
            <React.Fragment key={param.name}>
              <span className="kaleido-param-separator">&gt;</span>
              <span className="kaleido-layout-param">
                {currentLayoutInfo.params?.[param.name] || ''}
              </span>
            </React.Fragment>
          ))}
      </div>
    );
  }

  // Render search mode (default) - using cmdk for dropdown filtering/navigation
  return (
    <div
      ref={containerRef}
      className={`kaleido-search-bar ${isTabLocked ? 'locked' : ''}`}
    >
      <span className="kaleido-search-prompt">
        {isTabLocked ? '⊘' : '>'}
      </span>
      <Command
        className="kaleido-command"
        filter={(value, search) => {
          // Custom filter that matches on layout name and description
          if (!search) return 1;
          const searchLower = search.toLowerCase();
          // Get layout info from registeredLayouts using value (which is layout.id)
          const layout = registeredLayouts?.[value];
          if (!layout) return 0;
          const nameMatch = layout.name?.toLowerCase().includes(searchLower);
          const descMatch = layout.description
            ?.toLowerCase()
            .includes(searchLower);
          return nameMatch ? 1 : descMatch ? 0.5 : 0;
        }}
        loop
      >
        <Command.Input
          ref={inputRef}
          className={`kaleido-search-input ${isTabLocked ? 'locked' : ''}`}
          placeholder={isTabLocked ? 'Tab is locked' : placeholder}
          value={isTabLocked ? '' : searchQuery}
          onValueChange={(value) => {
            if (!isTabLocked) {
              onSearchChange?.(value);
              // Keep dropdown open when typing (will show filtered results or displayedLayouts)
              if (useDropdown) {
                onDropdownVisibilityChange?.(true);
              }
            }
          }}
          onFocus={handleSearchInputFocus}
          onBlur={handleSearchInputBlur}
          onKeyDown={(e) => {
            // Handle Escape to close dropdown
            if (e.key === 'Escape') {
              onDropdownVisibilityChange?.(false);
              onSearchChange?.('');
            }
            // Let cmdk handle arrow keys and Enter
          }}
          autoFocus={isNewTab && !useDropdown}
          disabled={isTabLocked}
        />
        {/* Dropdown for search results using cmdk Command.List */}
        {!isTabLocked && useDropdown && showDropdown && filteredLayouts && (
          <Command.List
            ref={dropdownRef}
            className="kaleido-search-dropdown"
          >
            <Command.Empty className="kaleido-search-empty">
              No layouts found
            </Command.Empty>
            {filteredLayouts.map((layout) => {
              const disabled = isLayoutDisabled?.(layout.id);
              return (
                <Command.Item
                  key={layout.id}
                  value={layout.id}
                  disabled={disabled}
                  onSelect={() => {
                    if (!disabled) {
                      // Close dropdown first to prevent cmdk internal state issues
                      onDropdownVisibilityChange?.(false);
                      // Then trigger selection after a tick
                      setTimeout(() => {
                        if (isNewTab) {
                          // In New Tab, select layout for current tab
                          onLayoutSelect?.(layout.id);
                        } else {
                          // When viewing a layout, also replace in current tab
                          onLayoutSelect?.(layout.id);
                        }
                      }, 0);
                    }
                  }}
                  className="kaleido-search-dropdown-item"
                >
                  <span className="kaleido-dropdown-name">
                    {layout.name}
                  </span>
                  <span className="kaleido-dropdown-description">
                    {layout.description}
                  </span>
                  {disabled && (
                    <span className="kaleido-dropdown-badge">Open</span>
                  )}
                </Command.Item>
              );
            })}
          </Command.List>
        )}
      </Command>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders when tab state changes
// SearchBar only re-renders when its specific props change
export default React.memo(KaleidoSearchBar);
