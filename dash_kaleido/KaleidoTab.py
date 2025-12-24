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


class KaleidoTab(Component):
    """A KaleidoTab component.
KaleidoTab is a container for tab content within KaleidoManager.
Each tab's content is wrapped in a KaleidoTab component which handles
visibility toggling based on the active tab.

Keyword arguments:

- children (a list of or a singular dash component, string or number; optional):
    The content to render inside this tab.

- className (string; optional):
    Additional CSS class names.

- loading_state (dict; optional):
    Object that holds the loading state object coming from
    dash-renderer.

    `loading_state` is a dict with keys:

    - is_loading (boolean | number | string | dict | list; optional):
        Determines if the component is loading or not.

    - prop_name (string; optional):
        Holds which property is loading.

    - component_name (string; optional):
        Holds the name of the component that is loading.

- id (string; optional):
    Unique ID to identify this component in Dash callbacks."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_kaleido'
    _type = 'KaleidoTab'
    LoadingState = TypedDict(
        "LoadingState",
            {
            "is_loading": NotRequired[typing.Any],
            "prop_name": NotRequired[typing.Union[str]],
            "component_name": NotRequired[typing.Union[str]]
        }
    )


    def __init__(
        self,
        children: typing.Optional[ComponentType] = None,
        style: typing.Optional[typing.Any] = None,
        className: typing.Optional[typing.Union[str]] = None,
        loading_state: typing.Optional[typing.Union["LoadingState"]] = None,
        id: typing.Optional[typing.Union[str, dict]] = None,
        **kwargs
    ):
        self._prop_names = ['children', 'style', 'className', 'loading_state', 'id']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['children', 'style', 'className', 'loading_state', 'id']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        super(KaleidoTab, self).__init__(children=children, **args)

setattr(KaleidoTab, "__init__", _explicitize_args(KaleidoTab.__init__))
