"""
Layout Registry for Dash Kaleido

This module provides utilities for registering and managing layouts
that can be used in KaleidoTabManager.
"""

import inspect
from typing import Dict, List, Optional, Union, Callable, Any, Mapping
from dash.development.base_component import Component, ComponentType


def get_function_parameters(func: Callable) -> List[Dict[str, Any]]:
    """
    Extract parameter information from a callable.
    
    Returns a list of parameter dictionaries with:
    - name: Parameter name
    - default: Default value (None if no default)
    - has_default: Whether the parameter has a default value
    - annotation: Type annotation string (if any)
    
    Parameters
    ----------
    func : Callable
        The function to inspect
    
    Returns
    -------
    List[Dict[str, Any]]
        List of parameter info dicts
    """
    if not callable(func):
        return []
    
    try:
        sig = inspect.signature(func)
    except (ValueError, TypeError):
        return []
    
    params = []
    for name, param in sig.parameters.items():
        # Skip *args, **kwargs
        if param.kind in (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD):
            continue
        
        param_info = {
            'name': name,
            'has_default': param.default is not inspect.Parameter.empty,
            'default': param.default if param.default is not inspect.Parameter.empty else None,
            'annotation': str(param.annotation) if param.annotation is not inspect.Parameter.empty else None
        }
        params.append(param_info)
    
    return params


class LayoutRegistry:
    """
    Global registry for Kaleido layouts.
    
    Layouts can be Dash components, lists of components, or callables
    that return components.
    """
    
    _layouts: Dict[str, Dict[str, Any]] = {}
    
    @classmethod
    def register(
        cls,
        layout_id: str,
        layout: Union[ComponentType, Callable[..., ComponentType]],
        name: Optional[str] = None,
        description: Optional[str] = None,
        keywords: Optional[List[str]] = None,
        static: bool = True,
        allow_multiple: bool = False,
        parameter_options: Optional[Dict[str, tuple]] = None
    ) -> None:
        """
        Register a layout for use in KaleidoTabManager.
        
        Parameters
        ----------
        layout_id : str
            Unique identifier for the layout
        layout : ComponentType or Callable[..., ComponentType]
            The layout to register. Can be a Dash component, list of components,
            or a callable that returns a component.
        name : str, optional
            Display name for the layout. Defaults to layout_id.
        description : str, optional
            Description of the layout
        keywords : List[str], optional
            Keywords for searching/filtering layouts
        static : bool, optional
            Whether this layout is static (evaluated once) or lazy (evaluated on-demand).
            Defaults to True (static).
        allow_multiple : bool, optional
            Whether multiple instances of this layout can be open simultaneously.
            If False (default), only one tab with this layout can exist at a time.
            If True, multiple tabs can use this layout, and component IDs will be
            automatically transformed to pattern-matching format with the tab ID
            as the index.
        parameter_options : dict, optional
            Pre-defined parameter configurations. When provided, users select from
            these options instead of entering parameters manually.
            Format: {'option_key': ('description', {'param1': value, 'param2': value})}
            Example:
                parameter_options={
                    'fast': ('Quick analysis mode', {'speed': 'fast', 'depth': 1}),
                    'deep': ('Thorough analysis', {'speed': 'slow', 'depth': 10}),
                }
        
        Examples
        --------
        >>> import dash_html_components as html
        >>> from dash_kaleido import register_layout
        >>> 
        >>> # Register a simple layout
        >>> register_layout(
        ...     'dashboard',
        ...     html.Div([html.H1('Dashboard')]),
        ...     name='Dashboard',
        ...     description='Main dashboard view',
        ...     keywords=['main', 'overview']
        ... )
        >>> 
        >>> # Register a callable layout
        >>> def create_report_layout():
        ...     return html.Div([html.H1('Report')])
        >>> register_layout('report', create_report_layout, name='Report')
        """
        if not layout_id:
            raise ValueError("layout_id cannot be empty")
        
        if layout_id in cls._layouts:
            raise ValueError(f"Layout '{layout_id}' is already registered")
        
        # Detect parameters if layout is callable
        parameters = []
        if callable(layout):
            parameters = get_function_parameters(layout)
        
        # Process parameter_options into a serializable format
        processed_options = None
        if parameter_options:
            processed_options = {}
            for key, value in parameter_options.items():
                if isinstance(value, tuple) and len(value) == 2:
                    desc, params = value
                    # Convert all param values to strings for consistency
                    str_params = {k: str(v) for k, v in params.items()}
                    processed_options[key] = {
                        'description': desc,
                        'params': str_params
                    }
        
        cls._layouts[layout_id] = {
            'id': layout_id,
            'layout': layout,
            'name': name or layout_id,
            'description': description or '',
            'keywords': keywords or [],
            'static': static,
            'allow_multiple': allow_multiple,
            'parameters': parameters,
            'parameter_options': processed_options
        }
    
    @classmethod
    def unregister(cls, layout_id: str) -> None:
        """
        Unregister a layout.
        
        Parameters
        ----------
        layout_id : str
            The ID of the layout to unregister
        """
        if layout_id in cls._layouts:
            del cls._layouts[layout_id]
    
    @classmethod
    def get_layout(cls, layout_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a registered layout by ID.
        
        Parameters
        ----------
        layout_id : str
            The ID of the layout to retrieve
        
        Returns
        -------
        dict or None
            The layout definition, or None if not found
        """
        return cls._layouts.get(layout_id)
    
    @classmethod
    def get_all_layouts(cls) -> Dict[str, Dict[str, Any]]:
        """
        Get all registered layouts.
        
        Returns
        -------
        dict
            Dictionary mapping layout IDs to layout definitions
        """
        return cls._layouts.copy()
    
    @classmethod
    def clear(cls) -> None:
        """Clear all registered layouts."""
        cls._layouts.clear()
    
    @classmethod
    def resolve_layout(cls, layout_id: str) -> Optional[ComponentType]:
        """
        Resolve a layout to an actual Dash component.
        
        If the layout is a callable, it will be called to generate the component.
        
        Parameters
        ----------
        layout_id : str
            The ID of the layout to resolve
        
        Returns
        -------
        Component or None
            The resolved Dash component, or None if layout not found
        """
        layout_info = cls.get_layout(layout_id)
        if not layout_info:
            return None
        
        layout = layout_info['layout']
        
        # If it's a callable, call it to get the component
        if callable(layout):
            return layout()  # type: ignore
        
        return layout


def register_layout(
    layout_id: str,
    layout: Union[ComponentType, Callable[..., ComponentType]],
    name: Optional[str] = None,
    description: Optional[str] = None,
    keywords: Optional[List[str]] = None,
    allow_multiple: bool = False
) -> None:
    """
    Register a layout for use in KaleidoTabManager.
    
    This is a convenience function that wraps LayoutRegistry.register().
    
    Parameters
    ----------
    layout_id : str
        Unique identifier for the layout
    layout : Component, List[Component], or Callable
        The layout to register
    name : str, optional
        Display name for the layout
    description : str, optional
        Description of the layout
    keywords : List[str], optional
        Keywords for searching/filtering layouts
    allow_multiple : bool, optional
        Whether multiple instances of this layout can be open simultaneously.
        If False (default), only one tab with this layout can exist at a time.
        If True, enables pattern-matching callbacks with tab ID as index.
    
    Examples
    --------
    >>> from dash import html
    >>> from dash_kaleido import register_layout
    >>> 
    >>> register_layout(
    ...     'home',
    ...     html.Div([html.H1('Home')]),
    ...     name='Home',
    ...     description='Home page layout'
    ... )
    >>> 
    >>> # Layout that can be opened multiple times
    >>> register_layout(
    ...     'chart',
    ...     html.Div([dcc.Graph(id='graph')]),
    ...     name='Chart',
    ...     allow_multiple=True  # Each tab gets unique IDs
    ... )
    """
    LayoutRegistry.register(
        layout_id=layout_id,
        layout=layout,
        name=name,
        description=description,
        keywords=keywords,
        allow_multiple=allow_multiple
    )


def unregister_layout(layout_id: str) -> None:
    """
    Unregister a layout.
    
    Parameters
    ----------
    layout_id : str
        The ID of the layout to unregister
    """
    LayoutRegistry.unregister(layout_id)


def get_registered_layouts() -> Dict[str, Dict[str, Any]]:
    """
    Get all registered layouts.
    
    Returns
    -------
    dict
        Dictionary mapping layout IDs to layout definitions
    """
    return LayoutRegistry.get_all_layouts()


def get_registered_layouts_metadata() -> Dict[str, Dict[str, Any]]:
    """
    Get metadata for all registered layouts (without the actual components).
    
    This is useful for passing to KaleidoManager's registeredLayouts prop.
    
    Returns
    -------
    dict
        Dictionary mapping layout IDs to metadata (name, description, keywords, parameters, parameterOptions)
    
    Examples
    --------
    >>> from dash_kaleido import register_layout, get_registered_layouts_metadata
    >>> register_layout('home', html.Div('Home'), name='Home', description='Home page')
    >>> metadata = get_registered_layouts_metadata()
    >>> # metadata = {'home': {'name': 'Home', 'description': 'Home page', 'keywords': [], 'parameters': []}}
    """
    metadata = {}
    all_layouts = LayoutRegistry.get_all_layouts()
    
    for layout_id, layout_info in all_layouts.items():
        # Get parameters and make them JSON-serializable
        params = layout_info.get('parameters', [])
        serializable_params = []
        for p in params:
            serializable_params.append({
                'name': p['name'],
                'hasDefault': p['has_default'],
                'default': p['default'] if p['default'] is not None else None,
                'annotation': p['annotation']
            })
        
        # Get parameter_options if present
        param_options = layout_info.get('parameter_options')
        
        metadata[layout_id] = {
            'name': layout_info['name'],
            'description': layout_info['description'],
            'keywords': layout_info['keywords'],
            'allowMultiple': layout_info.get('allow_multiple', False),
            'parameters': serializable_params,
            'parameterOptions': param_options  # Already in correct format from register()
        }
    
    return metadata
