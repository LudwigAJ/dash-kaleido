import React from 'react';
import RealComponent from '@/fragments/KaleidoManager/KaleidoManager';
import { DashComponentProps } from '../props';

type Props = {
    /**
     * Inline CSS styles to apply to the root container.
     */
    style?: object;
    /**
     * The layout ID of the currently active tab. Updates when user switches tabs.
     * Can be set from Python to programmatically switch to a tab with that layoutId.
     */
    activeTab?: string;
    /**
     * Full data object for the currently active tab, or null if a "New Tab" is active.
     * Contains: id (unique tab UUID), layoutId, name (display name), createdAt,
     * layoutParams (object with parameter values if the layout was opened with parameters).
     * Read-only from Python - use activeTab to switch tabs programmatically.
     */
    activeTabData?: object;
    /**
     * Array of all open tabs with their full state.
     * Each tab object contains: id, layoutId, name, createdAt, layoutParams.
     * Can be set from Python to restore/manipulate tab state.
     */
    tabs?: object[];
    /**
     * Object mapping layout IDs to layout metadata.
     * Layouts themselves are registered via register_layout/register_layout_callback.
     */
    registeredLayouts?: object;
    /**
     * List of layout IDs to recommend when user opens "New Tab" on the client.
     */
    displayedLayouts?: string[];
    /**
     * The layout ID to open by default when there is no persisted state.
     * If not specified, shows the "New Tab" layout selector.
     */
    initialTab?: string;
    /**
     * Theme for the component: 'light' or 'dark'.
     */
    theme?: string;
    /**
     * If true, shows a thin status bar at the bottom of the component.
     */
    enableStatusBar?: boolean;
    /**
     * Configuration for the search bar behavior and appearance.
     */
    searchBarConfig?: object;
    /**
     * Controls the overflow behavior of the layout content area.
     * Options: 'auto', 'scroll', 'hidden', 'visible'.
     */
    contentOverflow?: string;
    /**
     * Maximum number of tabs allowed. -1 means no limit.
     * When the limit is reached, the + button is disabled.
     */
    maxTabs?: number;
    /**
     * Used to allow user interactions to be persisted when
     * the component or page is refreshed.
     */
    persistence?: boolean | string | number;
    /**
     * Properties whose user interactions will persist after refreshing.
     * Defaults to ['activeTab', 'tabs'].
     */
    persisted_props?: string[];
    /**
     * Where persisted user changes will be stored:
     * 'memory', 'local', or 'session'.
     */
    persistence_type?: string;
    /**
     * Object that holds the loading state object coming from dash-renderer.
     */
    loading_state?: object;
    /**
     * The content to render for the active tab.
     */
    children?: React.ReactNode;
    /**
     * Array of tab data for tabs that have a layout selected.
     * Used to trigger the Python callback that renders all tab contents.
     */
    tabsData?: object[];
} & DashComponentProps;

/**
 * KaleidoManager provides powerful layout and tab management for Dash applications.
 * It allows users to create, manage, and organize multiple tabs with different layouts.
 */
const KaleidoManager = (props: Props) => {
    return <RealComponent {...(props as any)} />;
};

// Critical: Tell Dash that children can be updated dynamically
(KaleidoManager as any).dashChildrenUpdate = true;

export default KaleidoManager;
