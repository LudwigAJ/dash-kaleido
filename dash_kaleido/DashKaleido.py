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


class DashKaleido(Component):
    """A DashKaleido component.
DashKaleido is an example component.
It takes a property, `label`, and displays it.
It renders an input with the property `value`
which is editable by the user.

Keyword arguments:

- label (string; required):
    A label that will be printed when this component is rendered.

- value (string; optional):
    The value displayed in the input.

- id (string; optional):
    Unique ID to identify this component in Dash callbacks."""
    _children_props: typing.List[str] = []
    _base_nodes = ['children']
    _namespace = 'dash_kaleido'
    _type = 'DashKaleido'


    def __init__(
        self,
        label: typing.Optional[str] = None,
        value: typing.Optional[typing.Union[str]] = None,
        id: typing.Optional[typing.Union[str, dict]] = None,
        **kwargs
    ):
        self._prop_names = ['label', 'value', 'id']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['label', 'value', 'id']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        for k in ['label']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')

        super(DashKaleido, self).__init__(**args)

setattr(DashKaleido, "__init__", _explicitize_args(DashKaleido.__init__))
