# AUTO GENERATED FILE - DO NOT EDIT

import typing  # noqa: F401
from typing_extensions import TypedDict, NotRequired, Literal # noqa: F401
from dash.development.base_component import Component, _explicitize_args

ComponentType = typing.Union[
    str,
    int,
    float,
    Component,
    None,
    typing.Sequence[typing.Union[str, int, float, Component, None]],
]

NumberType = typing.Union[
    typing.SupportsFloat, typing.SupportsInt, typing.SupportsComplex
]


class KaleidoManager(Component):
    """A KaleidoManager component.
KaleidoManager provides powerful layout and tab management for Dash applications.
It allows users to create, manage, and organize multiple tabs with different layouts.

Keyword arguments:

- activeTab (string; optional):
    The layout ID of the currently active tab. Updates when user
    switches tabs. Can be set from Python to programmatically switch
    to a tab with that layoutId.

- activeTabData (dict; optional):
    Full data object for the currently active tab, or None if a \"New
    Tab\" is active. Contains: id (unique tab UUID), layoutId, name
    (display name), createdAt, layoutParams (object with parameter
    values if the layout was opened with parameters). Read-only from
    Python - use activeTab to switch tabs programmatically.

- tabs (list of dicts; optional):
    Array of all open tabs with their full state. Each tab object
    contains: id, layoutId, name, createdAt, layoutParams. Can be set
    from Python to restore/manipulate tab state.

- registeredLayouts (dict; optional):
    Object mapping layout IDs to layout metadata. Layouts themselves
    are registered via register_layout/register_layout_callback.

- displayedLayouts (list of strings; optional):
    List of layout IDs to recommend when user opens \"New Tab\" on the
    client.

- initialTab (string; optional):
    The layout ID to open by default when there is no persisted state.
    If not specified, shows the \"New Tab\" layout selector.

- theme (string; optional):
    Theme for the component: 'light' or 'dark'.

- enableStatusBar (boolean | number | string | dict | list; optional):
    If True, shows a thin status bar at the bottom of the component.

- searchBarConfig (dict; optional):
    Configuration for the search bar behavior and appearance.

- contentOverflow (string; optional):
    Controls the overflow behavior of the layout content area.
    Options: 'auto', 'scroll', 'hidden', 'visible'.

- maxTabs (number; optional):
    Maximum number of tabs allowed. -1 means no limit. When the limit
    is reached, the + button is disabled.

- persistence (string | number; optional):
    Used to allow user interactions to be persisted when the component
    or page is refreshed.

- persisted_props (list of strings; optional):
    Properties whose user interactions will persist after refreshing.
    Defaults to ['activeTab', 'tabs'].

- persistence_type (string; optional):
    Where persisted user changes will be stored: 'memory', 'local', or
    'session'.

- loading_state (dict; optional):
    Object that holds the loading state object coming from
    dash-renderer.

- children (a list of or a singular dash component, string or number; optional):
    The content to render for the active tab.

- tabsData (list of dicts; optional):
    Array of tab data for tabs that have a layout selected. Used to
    trigger the Python callback that renders all tab contents.

- id (string; optional):
    Unique ID to identify this component in Dash callbacks."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_kaleido'
    _type = 'KaleidoManager'


    def __init__(
        self,
        children: typing.Optional[ComponentType] = None,
        style: typing.Optional[typing.Any] = None,
        activeTab: typing.Optional[typing.Union[str]] = None,
        activeTabData: typing.Optional[typing.Union[dict]] = None,
        tabs: typing.Optional[typing.Union[typing.Sequence[dict]]] = None,
        registeredLayouts: typing.Optional[typing.Union[dict]] = None,
        displayedLayouts: typing.Optional[typing.Union[typing.Sequence[str]]] = None,
        initialTab: typing.Optional[typing.Union[str]] = None,
        theme: typing.Optional[typing.Union[str]] = None,
        enableStatusBar: typing.Optional[typing.Any] = None,
        searchBarConfig: typing.Optional[typing.Union[dict]] = None,
        contentOverflow: typing.Optional[typing.Union[str]] = None,
        maxTabs: typing.Optional[typing.Union[NumberType]] = None,
        persistence: typing.Optional[typing.Union[str, NumberType]] = None,
        persisted_props: typing.Optional[typing.Union[typing.Sequence[str]]] = None,
        persistence_type: typing.Optional[typing.Union[str]] = None,
        loading_state: typing.Optional[typing.Union[dict]] = None,
        tabsData: typing.Optional[typing.Union[typing.Sequence[dict]]] = None,
        id: typing.Optional[typing.Union[str, dict]] = None,
        **kwargs
    ):
        self._prop_names = ['style', 'activeTab', 'activeTabData', 'tabs', 'registeredLayouts', 'displayedLayouts', 'initialTab', 'theme', 'enableStatusBar', 'searchBarConfig', 'contentOverflow', 'maxTabs', 'persistence', 'persisted_props', 'persistence_type', 'loading_state', 'children', 'tabsData', 'id']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['style', 'activeTab', 'activeTabData', 'tabs', 'registeredLayouts', 'displayedLayouts', 'initialTab', 'theme', 'enableStatusBar', 'searchBarConfig', 'contentOverflow', 'maxTabs', 'persistence', 'persisted_props', 'persistence_type', 'loading_state', 'children', 'tabsData', 'id']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        super(KaleidoManager, self).__init__(children=children, **args)

setattr(KaleidoManager, "__init__", _explicitize_args(KaleidoManager.__init__))
