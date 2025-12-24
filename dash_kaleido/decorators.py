"""
Decorators for registering layouts in Dash Kaleido.

Provides @register_layout and @register_layout_callback decorators
to simplify layout management and automatic callback creation.
"""

import inspect
from typing import Optional, List, Callable, Any, Dict
from functools import wraps
from .layout_registry import LayoutRegistry, get_function_parameters


def register_layout_callback(
    layout_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    keywords: Optional[List[str]] = None,
    allow_multiple: bool = False,
    parameter_options: Optional[Dict[str, tuple]] = None
):
    """
    Decorator to register a callable/lazy layout.
    
    Lazy/callable layouts are evaluated on-demand when a tab is activated.
    Use this for layouts that depend on dynamic user input or server state.
    
    For layouts with parameters, the parameters will be prompted in the UI
    and passed as strings to the function. Alternatively, you can provide
    pre-defined parameter configurations via `parameter_options`.
    
    Parameters
    ----------
    layout_id : str
        Unique identifier for the layout
    name : str, optional
        Display name for the layout. Defaults to layout_id.
    description : str, optional
        Description of the layout for display in layout selector
    keywords : List[str], optional
        Keywords for searching/filtering layouts
    allow_multiple : bool, optional
        Whether multiple instances of this layout can be open simultaneously.
        If False (default), only one tab with this layout can exist at a time.
        If True, enables pattern-matching callbacks with tab ID as index.
    parameter_options : Dict[str, tuple], optional
        Pre-defined parameter configurations for parameterized layouts.
        When provided, users select from these options instead of entering
        values manually. Format: {'key': ('description', {'param': value, ...})}
        
        Example:
            parameter_options={
                'small': ('Small size (10x10)', {'width': 10, 'height': 10}),
                'large': ('Large size (100x100)', {'width': 100, 'height': 100}),
            }
    
    Returns
    -------
    Callable
        Decorator function
    
    Examples
    --------
    >>> from dash import html
    >>> import dash_kaleido
    >>> 
    >>> @dash_kaleido.register_layout_callback(
    ...     'home',
    ...     name='Home',
    ...     description='Welcome page',
    ...     keywords=['welcome', 'intro']
    ... )
    ... def home_layout():
    ...     return html.Div([
    ...         html.H1('Welcome to Dash Kaleido'),
    ...         html.P('This is a callable layout.')
    ...     ])
    >>> 
    >>> # Layout with parameters - prompts user for input
    >>> @dash_kaleido.register_layout_callback(
    ...     'greeting',
    ...     name='Greeting',
    ...     description='Personalized greeting page'
    ... )
    ... def greeting_layout(name, title='Welcome'):
    ...     # Parameters are always passed as strings
    ...     return html.Div([html.H1(f'{title}, {name}!')])
    >>> 
    >>> # Layout with parameter_options - users select from pre-defined configs
    >>> @dash_kaleido.register_layout_callback(
    ...     'grid',
    ...     name='Grid View',
    ...     parameter_options={
    ...         'small': ('Small 5x5 grid', {'rows': 5, 'cols': 5}),
    ...         'medium': ('Medium 10x10 grid', {'rows': 10, 'cols': 10}),
    ...     }
    ... )
    ... def grid_layout(rows, cols):
    ...     return html.Div(f'Grid: {rows}x{cols}')
    """
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        # Check if the function has parameters
        params = get_function_parameters(func)
        
        if params:
            # Function has parameters - store as callable, don't evaluate yet
            # Register the function itself (not its result)
            LayoutRegistry.register(
                layout_id=layout_id,
                layout=func,  # Store the function, not its result
                name=name,
                description=description,
                keywords=keywords,
                static=False,
                allow_multiple=allow_multiple,
                parameter_options=parameter_options
            )
            
            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            
            return wrapper
        else:
            # No parameters - evaluate once at registration time (original behavior)
            layout_component = func()
            
            LayoutRegistry.register(
                layout_id=layout_id,
                layout=layout_component,
                name=name,
                description=description,
                keywords=keywords,
                static=False,
                allow_multiple=allow_multiple
            )
            
            @wraps(func)
            def wrapper():
                return layout_component
            
            return wrapper
    
    return decorator
