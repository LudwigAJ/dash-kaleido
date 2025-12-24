"""
Layout Utilities for Dash Kaleido

This module provides utilities for walking and transforming Dash layout trees,
including ID injection for pattern-matching callbacks support.
"""

from typing import Union, List, Callable, Any, Optional
from dash.development.base_component import Component


def walk_layout(
    layout: Union[Component, List, dict, Any],
    transform_fn: Callable[[Component], Component]
) -> Union[Component, List, dict, Any]:
    """
    Recursively walk a Dash layout tree and apply a transform function to each component.
    
    This function traverses the entire component tree, applying the transform function
    to each Dash Component it encounters. It handles:
    - Single components
    - Lists/tuples of components
    - Nested children
    - Components in _children_props (e.g., header, footer slots)
    
    Parameters
    ----------
    layout : Component, list, dict, or primitive
        The layout to walk. Can be a Dash component, list of components,
        dictionary, or primitive value.
    transform_fn : Callable[[Component], Component]
        Function that takes a Component and returns a (possibly modified) Component.
        The function is called for each component in the tree.
    
    Returns
    -------
    Union[Component, List, dict, Any]
        The transformed layout with the same structure as the input.
    
    Examples
    --------
    >>> from dash import html
    >>> def add_class(component):
    ...     if hasattr(component, 'className'):
    ...         component.className = (component.className or '') + ' transformed'
    ...     return component
    >>> 
    >>> layout = html.Div([html.H1('Title'), html.P('Content')])
    >>> transformed = walk_layout(layout, add_class)
    """
    # Handle Component
    if isinstance(layout, Component):
        # Apply transform to this component
        transformed = transform_fn(layout)
        
        # Recursively process children
        if hasattr(transformed, 'children') and transformed.children is not None:
            transformed.children = walk_layout(transformed.children, transform_fn)
        
        # Handle _children_props - props that can contain Dash components
        # This handles cases like dcc.Tab(children=...), dbc.Card(header=...)
        children_props = getattr(transformed, '_children_props', [])
        if children_props:
            for prop_path in children_props:
                _transform_children_prop(transformed, prop_path, transform_fn)
        
        return transformed
    
    # Handle list/tuple of components
    if isinstance(layout, (list, tuple)):
        result = [walk_layout(item, transform_fn) for item in layout]
        return type(layout)(result) if isinstance(layout, tuple) else result
    
    # Handle dict (could be props dict, but not a component)
    if isinstance(layout, dict):
        # Check if it looks like a serialized component (has 'type' and 'namespace')
        # This is rare in practice but possible
        if 'type' in layout and 'namespace' in layout and 'props' in layout:
            # It's a serialized component - we'd need to deserialize to transform
            # For now, return as-is (components should be actual Component instances)
            pass
        return layout
    
    # Primitives (str, int, None, etc.) - return as-is
    return layout


def _transform_children_prop(
    component: Component,
    prop_path: str,
    transform_fn: Callable[[Component], Component]
) -> None:
    """
    Transform a children prop at the given path.
    
    Handles patterns like:
    - 'propName' - single prop
    - 'propName[]' - array prop
    - 'propName[].field' - field in array items
    """
    # Parse the prop path
    parts = prop_path.split('.')
    
    if not parts:
        return
    
    first_part = parts[0]
    
    # Check for array notation
    is_array = first_part.endswith('[]')
    prop_name = first_part.rstrip('[]')
    
    # Get the prop value
    if not hasattr(component, prop_name):
        return
    
    prop_value = getattr(component, prop_name)
    if prop_value is None:
        return
    
    if len(parts) == 1:
        # Simple prop or array of components
        if is_array and isinstance(prop_value, (list, tuple)):
            # Array of components
            transformed = [walk_layout(item, transform_fn) for item in prop_value]
            setattr(component, prop_name, transformed)
        elif isinstance(prop_value, Component):
            # Single component
            setattr(component, prop_name, walk_layout(prop_value, transform_fn))
    else:
        # Nested path (e.g., 'items[].content')
        remaining_path = '.'.join(parts[1:])
        if is_array and isinstance(prop_value, (list, tuple)):
            # Process each item in the array
            for item in prop_value:
                if isinstance(item, dict):
                    _transform_dict_path(item, remaining_path, transform_fn)
        elif isinstance(prop_value, dict):
            _transform_dict_path(prop_value, remaining_path, transform_fn)


def _transform_dict_path(
    d: dict,
    path: str,
    transform_fn: Callable[[Component], Component]
) -> None:
    """Transform a component at a path within a dictionary."""
    parts = path.split('.')
    
    if not parts:
        return
    
    first_part = parts[0]
    is_array = first_part.endswith('[]')
    key = first_part.rstrip('[]')
    
    if key not in d:
        return
    
    value = d[key]
    
    if len(parts) == 1:
        # This is the final key
        if is_array and isinstance(value, (list, tuple)):
            d[key] = [walk_layout(item, transform_fn) for item in value]
        elif isinstance(value, Component):
            d[key] = walk_layout(value, transform_fn)
    else:
        # More path to traverse
        remaining_path = '.'.join(parts[1:])
        if is_array and isinstance(value, (list, tuple)):
            for item in value:
                if isinstance(item, dict):
                    _transform_dict_path(item, remaining_path, transform_fn)
        elif isinstance(value, dict):
            _transform_dict_path(value, remaining_path, transform_fn)


def create_id_injector(tab_id: str) -> Callable[[Component], Component]:
    """
    Create a transform function that injects tab_id into component IDs.
    
    This function creates a transformer for use with walk_layout that converts
    component IDs to pattern-matching format, enabling multiple instances of
    the same layout to coexist with isolated state.
    
    ID Transformation Rules:
    - String ID "my-id" → {"type": "my-id", "index": tab_id}
    - Dict ID without "index" → Add "index": tab_id
    - Dict ID WITH "index" already set → NO CHANGE (user's pattern-matching)
    - No ID → NO CHANGE
    
    Parameters
    ----------
    tab_id : str
        The unique tab identifier to inject as the "index" value.
    
    Returns
    -------
    Callable[[Component], Component]
        A transform function suitable for use with walk_layout.
    
    Examples
    --------
    >>> from dash import html, dcc
    >>> injector = create_id_injector("abc-123")
    >>> 
    >>> # String ID gets transformed
    >>> component = html.Div(id="my-div")
    >>> transformed = injector(component)
    >>> transformed.id
    {'type': 'my-div', 'index': 'abc-123'}
    >>> 
    >>> # Dict ID with index is left alone
    >>> component = dcc.Input(id={"type": "input", "index": 0})
    >>> transformed = injector(component)
    >>> transformed.id
    {'type': 'input', 'index': 0}
    """
    def transform(component: Component) -> Component:
        # Skip if no ID
        if not hasattr(component, 'id') or component.id is None:
            return component
        
        current_id = component.id
        
        # Case 1: String ID → Convert to pattern-matching format
        if isinstance(current_id, str):
            component.id = {"type": current_id, "index": tab_id}
        
        # Case 2: Dict ID
        elif isinstance(current_id, dict):
            # If "index" is already set, user is doing their own pattern-matching
            # DO NOT modify - respect user's configuration
            if "index" in current_id:
                pass  # No change
            else:
                # Add index to existing dict ID
                component.id = {**current_id, "index": tab_id}
        
        return component
    
    return transform


def inject_tab_id(
    layout: Union[Component, List[Component]],
    tab_id: str
) -> Union[Component, List[Component]]:
    """
    Inject tab_id into all component IDs in a layout.
    
    This function transforms all component IDs in a layout tree to enable
    pattern-matching callbacks. It's used when allow_multiple=True for a layout,
    allowing multiple instances of the same layout to have isolated state.
    
    Parameters
    ----------
    layout : Component or List[Component]
        The layout(s) to transform. Can be a single Dash component or
        a list of components.
    tab_id : str
        The unique tab identifier to inject as "index" in each component ID.
    
    Returns
    -------
    Component or List[Component]
        The transformed layout with injected IDs. The structure matches the input.
    
    Examples
    --------
    >>> from dash import html, dcc
    >>> 
    >>> layout = html.Div([
    ...     html.H1("Title", id="title"),
    ...     dcc.Input(id="my-input", value=""),
    ...     html.Div(id="output")
    ... ], id="container")
    >>> 
    >>> transformed = inject_tab_id(layout, "tab-abc-123")
    >>> 
    >>> # All IDs are now pattern-matching format:
    >>> # {"type": "container", "index": "tab-abc-123"}
    >>> # {"type": "title", "index": "tab-abc-123"}
    >>> # {"type": "my-input", "index": "tab-abc-123"}
    >>> # {"type": "output", "index": "tab-abc-123"}
    
    Notes
    -----
    - Components without IDs are left unchanged
    - Components with dict IDs that already have "index" are left unchanged
    - This enables callbacks using MATCH, ALL, or ALLSMALLER wildcards
    """
    transform_fn = create_id_injector(tab_id)
    return walk_layout(layout, transform_fn)
