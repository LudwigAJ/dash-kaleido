import React from 'react';
import { DashComponentProps } from '../props';

type Props = {
    /**
     * The content to render inside this tab.
     */
    children?: React.ReactNode;
    /**
     * Inline styles to apply to the tab container.
     */
    style?: object;
    /**
     * Additional CSS class names.
     */
    className?: string;
    /**
     * Object that holds the loading state object coming from dash-renderer.
     */
    loading_state?: {
        /**
         * Determines if the component is loading or not
         */
        is_loading?: boolean;
        /**
         * Holds which property is loading
         */
        prop_name?: string;
        /**
         * Holds the name of the component that is loading
         */
        component_name?: string;
    };
} & DashComponentProps;

/**
 * KaleidoTab is a container for tab content within KaleidoManager.
 * Each tab's content is wrapped in a KaleidoTab component which handles
 * visibility toggling based on the active tab.
 */
const KaleidoTab = (props: Props) => {
    const { id, children, style = {}, className = '', loading_state } = props;

    const isLoading = loading_state?.is_loading;

    return (
        <div
            id={id}
            className={`h-full w-full ${className}${isLoading ? ' animate-pulse' : ''}`}
            style={style}
            data-dash-is-loading={isLoading || undefined}
        >
            {children}
        </div>
    );
};

// Critical: Tell Dash that children can be updated dynamically
(KaleidoTab as any).dashChildrenUpdate = true;

export default KaleidoTab;
