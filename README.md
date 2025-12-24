# Dash Kaleido

**Powerful tab management for Dash applications**

Dash Kaleido provides an advanced tab management system for Plotly Dash, allowing users to dynamically create, organize, and manage multiple tabs with different layouts. Perfect for building complex dashboards and multi-view applications.

## Features

- **Themes** - Light and dark themes with CSS custom properties for easy customization
- **Dynamic Tab Management** - Create, rename, reorder, and close tabs on the fly
- **Searchable Layout Library** - Find the perfect layout with keyword search and dropdown
- **Persistence Support** - Save tab state to local storage, session storage, or memory
- **Drag & Drop** - Reorder tabs with intuitive drag-and-drop
- **Context Menus** - Right-click tabs for rename and info options
- **Layout Registration** - Register static or callback-based layouts with ease
- **Parameterized Layouts** - Create layouts that accept user input parameters
- **Status Bar** - Optional status bar showing current mode, layout, and sync info
- **Dash Integration** - Full support for Dash callbacks and components

## Installation

### From PyPI (Recommended)

```bash
pip install dash-kaleido
```

### From Source

```bash
git clone https://github.com/LudwigAJ/dash-kaleido.git
cd dash-kaleido
npm install
npm run build
pip install -e .
```

### Requirements

- **Python**: >= 3.9
- **Dash**: >= 2.4.0
- **Node.js**: >= 18 (for development only)

**Python Dependencies:**
- `dash` >= 2.4.0

## Quick Start

```python
from dash import Dash, html
import dash_kaleido

app = Dash(__name__)

# Register a static layout
dash_kaleido.register_layout(
    layout_id='home',
    name='Home',
    description='Welcome page',
    keywords=['welcome', 'intro'],
    layout=html.Div([
        html.H1('Welcome to My App'),
        html.P('This is the home page.')
    ])
)

# Register a callback layout (lazy-loaded)
@dash_kaleido.register_layout_callback(
    layout_id='dashboard',
    name='Dashboard',
    description='Main dashboard with real-time data',
    keywords=['main', 'metrics']
)
def dashboard_layout():
    # This executes when the tab is activated
    return html.Div([
        html.H1('Dashboard'),
        html.P('Dynamic content loaded on-demand.')
    ])

# Create the app layout
app.layout = html.Div([
    dash_kaleido.KaleidoManager(
        id='kaleido',
        displayedLayouts=['home', 'dashboard'],
        initialTab='home',
        theme='light',
        enableStatusBar=True,
        searchBarConfig={
            'show': True,
            'placeholder': 'Search layouts...',
            'position': 'under',
        }
    )
])

# Initialize Kaleido (must be after app.layout)
dash_kaleido.init(app, 'kaleido')

if __name__ == '__main__':
    app.run(debug=True)
```

## Usage

### Registering Layouts

Dash Kaleido provides two primary methods for registering layouts:

#### Method 1: Static Layouts with `register_layout()`

Use for pre-defined content that doesn't need dynamic computation:

```python
import dash_kaleido
from dash import html, dcc

dash_kaleido.register_layout(
    layout_id='about',
    name='About',
    description='About page with static content',
    keywords=['about', 'info', 'help'],
    layout=html.Div([
        html.H1('About Us'),
        html.P('Static content that loads immediately.')
    ])
)
```

**Best for:** Fixed content, About/Help pages, documentation

#### Method 2: Callback Layouts with `@register_layout_callback`

Use the decorator for layouts that should execute when accessed:

```python
import dash_kaleido
from dash import html, dcc
import plotly.express as px

@dash_kaleido.register_layout_callback(
    layout_id='world-data',
    name='World Data',
    description='Interactive Gapminder visualization',
    keywords=['gapminder', 'world', 'countries']
)
def world_data_layout():
    # This function executes when the user opens this tab
    df = px.data.gapminder()
    fig = px.scatter(df.query("year==2007"), x="gdpPercap", y="lifeExp",
                     size="pop", color="continent", hover_name="country")
    return html.Div([
        html.H1('World Data'),
        dcc.Graph(figure=fig)
    ])
```

**Best for:** Expensive computations, real-time data, dynamic content

### Parameterized Layouts

Create layouts that accept user input:

```python
@dash_kaleido.register_layout_callback(
    layout_id='greeting',
    name='Custom Greeting',
    description='A personalized greeting page',
    keywords=['greeting', 'hello', 'welcome']
)
def greeting_layout(name):
    """Layout that requires a name parameter."""
    return html.Div([
        html.H1(f'Hello, {name}!'),
        html.P('Welcome to your personalized dashboard.')
    ])
```

When users select this layout, they'll be prompted to enter the required parameters.

### Pre-defined Parameter Options

For layouts with specific configurations, use `parameter_options`:

```python
@dash_kaleido.register_layout_callback(
    layout_id='continent-comparison',
    name='Continent Comparison',
    description='Compare life expectancy across countries',
    keywords=['continent', 'comparison'],
    parameter_options={
        'africa': ('Africa - 52 countries', {'continent': 'Africa', 'metric': 'lifeExp'}),
        'americas': ('Americas - 25 countries', {'continent': 'Americas', 'metric': 'lifeExp'}),
        'asia': ('Asia - 33 countries', {'continent': 'Asia', 'metric': 'lifeExp'}),
        'europe': ('Europe - 30 countries', {'continent': 'Europe', 'metric': 'lifeExp'}),
    }
)
def continent_comparison_layout(continent, metric='lifeExp'):
    """Layout showing comparison of countries within a continent."""
    df = px.data.gapminder()
    continent_df = df[(df['continent'] == continent) & (df['year'] == 2007)]
    fig = px.bar(continent_df.sort_values(metric), y='country', x=metric, orientation='h')
    return html.Div([
        html.H1(f'{continent} Comparison'),
        dcc.Graph(figure=fig)
    ])
```

Users will see a selection modal with the pre-defined options instead of entering parameters manually.

### Allow Multiple Instances

Enable multiple tabs with the same layout (useful for comparison views):

```python
@dash_kaleido.register_layout_callback(
    layout_id='country-explorer',
    name='Country Explorer',
    description='Explore data for a specific country',
    keywords=['country', 'explore'],
    allow_multiple=True  # Multiple tabs can use this layout
)
def country_explorer_layout(country, year='2007'):
    # Each instance can have different parameters
    return html.Div([html.H1(f'Exploring {country}')])
```

### The `init()` Function

After defining your layout, you must call `init()` to set up the rendering callback:

```python
app.layout = html.Div([
    dash_kaleido.KaleidoManager(id='kaleido', ...)
])

# IMPORTANT: Call init() after setting app.layout
dash_kaleido.init(app, 'kaleido')
```

This function:
- Populates `registeredLayouts` with metadata from the registry
- Creates the callback to render layout content
- Handles static vs. lazy layouts automatically
- Injects tab IDs for `allow_multiple=True` layouts

## KaleidoManager Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | string/dict | **required** | Component ID for Dash callbacks |
| `displayedLayouts` | array | `[]` | Layout IDs to show in the "New Tab" picker |
| `initialTab` | string | `None` | Layout ID to open by default (if no persisted state) |
| `theme` | string | `'light'` | Theme: `'light'` or `'dark'` |
| `enableStatusBar` | boolean | `False` | Show status bar at bottom with mode, layout, and sync info |
| `searchBarConfig` | object | `{}` | Configuration for the search bar (see below) |
| `contentOverflow` | string | `'auto'` | Content overflow: auto, scroll, hidden, visible |
| `tabs` | array | `[]` | Current tabs state (readable/writable) |
| `activeTab` | string | - | Layout ID of active tab |
| `activeTabData` | object | - | Full data for active tab (read-only) |
| `tabsData` | array | - | Array of tab data for rendering (internal use) |
| `registeredLayouts` | object | `{}` | Layout metadata (auto-populated by `init()`) |
| `persistence` | bool/string | `False` | Enable state persistence |
| `persistence_type` | string | `'local'` | Where to persist: local, session, memory |
| `persisted_props` | array | `['activeTab']` | Which props to persist |
| `style` | object | - | Inline CSS styles for root container |

### searchBarConfig Options

```python
searchBarConfig={
    'show': True,                    # Always show search bar (even when viewing a layout)
    'placeholder': 'Search...',      # Placeholder text
    'position': 'under',             # 'top', 'under' (below tabs), or 'bottom'
    'showDropdownInNewTab': True,    # Show dropdown instead of filtering cards in New Tab view
    'spawnLayoutInNewTab': False,    # Open selected layout in new tab (vs. current tab)
    'displayedLayouts': ['home', 'dashboard']  # Layouts to show in dropdown on focus
}
```

## Themes

Dash Kaleido includes light and dark themes with CSS custom properties for easy customization:

```python
# Light theme (default)
theme='light'

# Dark theme
theme='dark'
```

### Customizing with CSS Variables

Override theme colors by targeting CSS variables:

```css
.kaleido-container {
    --kaleido-bg: #ffffff;
    --kaleido-text: #1a202c;
    --kaleido-accent: #3498db;
    --kaleido-tab-bar-bg: #f7fafc;
    --kaleido-border: #e2e8f0;
    /* ... many more variables available */
}
```

## Status Bar

Enable the status bar to show current state information:

```python
dash_kaleido.KaleidoManager(
    id='kaleido',
    enableStatusBar=True,
    # ...
)
```

The status bar displays:
- Current mode (viewing layout or New Tab selector)
- Active layout name
- Clickable tab info (shows popup with tab ID, layout ID, creation time, parameters)
- Last sync time (updates when communicating with Python server)

## Persistence

Enable persistence to save tab state across sessions:

```python
dash_kaleido.KaleidoManager(
    id='kaleido',
    persistence=True,              # or use a string ID for multiple instances
    persistence_type='local',      # 'local', 'session', or 'memory'
    persisted_props=['activeTab'], # Which props to persist
    # ...
)
```

## Working with Callbacks

Access tab state in callbacks:

```python
from dash import callback, Input, Output

@callback(
    Output('output', 'children'),
    Input('kaleido', 'activeTabData')
)
def on_tab_change(tab_data):
    if not tab_data:
        return "New Tab selected"
    return f"Viewing: {tab_data['name']} (layout: {tab_data['layoutId']})"

# Update theme dynamically
@callback(
    Output('kaleido', 'theme'),
    Input('theme-dropdown', 'value')
)
def update_theme(theme):
    return theme
```

## User Interactions

**Adding Tabs:**
- Click the `+` button next to the last tab
- Select a layout from the "New Tab" view or search dropdown

**Reordering Tabs:**
- Click and drag tabs left or right

**Renaming Tabs:**
- Right-click on a tab → Select "Rename"
- Or double-click the tab name
- Enter new name and press Enter or click "Rename"

**Viewing Tab Info:**
- Right-click on a tab → Select "Info"
- Or click the tab name in the status bar
- View tab name, ID, creation date, layout, and parameters

**Closing Tabs:**
- Click the `×` button on a tab
- Or right-click and select "Close Tab"
- Note: Cannot close the last remaining tab

**Searching Layouts:**
- Use the search bar to filter by name, description, or keywords
- With `showDropdownInNewTab: true`, typing shows a dropdown
- Focus the empty search bar to see `displayedLayouts` in dropdown

**Keyboard Shortcuts:**
- `Enter` - Select highlighted item / confirm
- `Escape` - Cancel / close dropdown
- `↑/↓` - Navigate dropdown items

## Advanced Example

See [usage.py](usage.py) for a complete example with:
- Static layouts (Home, Settings)
- Lazy/callback layouts (data visualizations)
- Parameterized layouts (Custom Greeting, Country Explorer)
- Pre-defined parameter options (Continent Comparison)
- Theme switching
- Status bar enabled

Run the example:

```bash
python usage.py
```

## API Reference

### Functions

#### `init(app, kaleido_id)`

Initialize Kaleido callbacks. **Must be called after `app.layout` is set.**

This function automatically:
- Populates the `KaleidoManager`'s `registeredLayouts` with metadata from the registry
- Creates the callback to render layout content based on `tabsData`
- Handles static vs. lazy layouts automatically
- Injects tab IDs for `allow_multiple=True` layouts

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `app` | `dash.Dash` | The Dash application instance |
| `kaleido_id` | `str` | The ID of the KaleidoManager component |

```python
app.layout = html.Div([dash_kaleido.KaleidoManager(id='kaleido', ...)])
dash_kaleido.init(app, 'kaleido')
```

---

#### `register_layout(layout_id, layout, name, description, keywords, static, allow_multiple, parameter_options)`

Register a static or callable layout for use in KaleidoManager.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `layout_id` | `str` | **required** | Unique identifier for the layout |
| `layout` | `Component` or `Callable` | **required** | The Dash component tree or a function that returns one |
| `name` | `str` | `layout_id` | Display name for the layout |
| `description` | `str` | `''` | Description shown in layout selector |
| `keywords` | `List[str]` | `[]` | Keywords for searching/filtering layouts |
| `static` | `bool` | `True` | Whether layout is pre-built (vs callable) |
| `allow_multiple` | `bool` | `False` | Allow multiple tabs with this layout |
| `parameter_options` | `dict` | `None` | Pre-defined parameter configurations |

```python
dash_kaleido.register_layout(
    layout_id='about',
    layout=html.Div([html.H1('About')]),
    name='About',
    description='About page',
    keywords=['about', 'info']
)
```

---

#### `@register_layout_callback(...)`

Decorator to register a callable/lazy layout. The decorated function is called when the tab is activated.

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `layout_id` | `str` | **required** | Unique identifier for the layout |
| `name` | `str` | `layout_id` | Display name for the layout |
| `description` | `str` | `None` | Description shown in layout selector |
| `keywords` | `List[str]` | `None` | Keywords for searching/filtering |
| `allow_multiple` | `bool` | `False` | Allow multiple tabs with this layout |
| `parameter_options` | `dict` | `None` | Pre-defined parameter configurations (see below) |

**`parameter_options` Format:**
```python
{
    'option_key': ('Description text', {'param1': value, 'param2': value}),
    ...
}
```

**Example:**
```python
@dash_kaleido.register_layout_callback(
    layout_id='dashboard',
    name='Dashboard',
    description='Main dashboard',
    keywords=['main'],
    allow_multiple=False,
    parameter_options={
        'small': ('Small grid (5x5)', {'rows': 5, 'cols': 5}),
        'large': ('Large grid (10x10)', {'rows': 10, 'cols': 10}),
    }
)
def dashboard_layout(rows=5, cols=5):
    return html.Div([html.H1(f'Grid: {rows}x{cols}')])
```

---

#### `render_layout_for_tab(active_tab_data)`

Helper to render the correct layout for a tab. Use this if you want to write your own callback instead of using `init()`.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `active_tab_data` | `dict` | The `activeTabData` from KaleidoManager |

**`active_tab_data` Structure:**
```python
{
    'id': str,           # Unique tab UUID
    'layoutId': str,     # The layout ID to render
    'name': str,         # Tab display name
    'createdAt': int,    # Unix timestamp
    'layoutParams': dict # Parameter values (optional)
}
```

**Returns:** `Component` or `None`

```python
from dash import callback, Input, Output
import dash_kaleido

@callback(
    Output('kaleido', 'children'),
    Input('kaleido', 'activeTabData')
)
def render_content(tab_data):
    return dash_kaleido.render_layout_for_tab(tab_data)
```

---

#### `get_registered_layouts_metadata()`

Get metadata for all registered layouts. Useful for debugging or building custom layout selectors.

**Returns:** `dict` - Dictionary mapping layout_id to metadata

```python
metadata = dash_kaleido.get_registered_layouts_metadata()
# {
#     'home': {'id': 'home', 'name': 'Home', 'description': '...', ...},
#     'dashboard': {'id': 'dashboard', 'name': 'Dashboard', ...}
# }
```

---

#### `walk_layout(layout, transform_fn)`

Recursively walk a Dash layout tree and apply a transform function to each component.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `layout` | `Component`, `list`, `dict`, or primitive | The layout to walk |
| `transform_fn` | `Callable[[Component], Component]` | Function to apply to each component |

**Returns:** The transformed layout with the same structure as input.

```python
from dash import html
from dash_kaleido import walk_layout

def add_class(component):
    if hasattr(component, 'className'):
        component.className = (component.className or '') + ' my-class'
    return component

layout = html.Div([html.H1('Title'), html.P('Content')])
transformed = walk_layout(layout, add_class)
```

---

#### `inject_tab_id(layout, tab_id)`

Inject `tab_id` into all component IDs in a layout. This enables pattern-matching callbacks for layouts with `allow_multiple=True`.

**ID Transformation Rules:**
- String ID `"my-id"` → `{"type": "my-id", "index": tab_id}`
- Dict ID without `"index"` → Add `"index": tab_id`
- Dict ID with `"index"` already set → No change (respects user's pattern-matching)
- No ID → No change

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `layout` | `Component` or `List[Component]` | The layout(s) to transform |
| `tab_id` | `str` | The unique tab identifier |

**Returns:** The transformed layout with injected IDs.

```python
from dash import html, dcc
from dash_kaleido import inject_tab_id

layout = html.Div([
    html.H1("Title", id="title"),
    dcc.Input(id="my-input", value="")
], id="container")

transformed = inject_tab_id(layout, "tab-abc-123")
# IDs are now: {"type": "container", "index": "tab-abc-123"}, etc.
```

---

### Components

#### `KaleidoManager`

The main React component for tab management. See [KaleidoManager Properties](#kaleidomanager-properties) for all available props.

#### `KaleidoTab`

Wrapper component for tab content. Created internally by `init()` - you typically don't need to use this directly.

#### `DashKaleido`

Low-level wrapper component (internal use).

---

### Classes

#### `LayoutRegistry`

Global registry for layouts. Access via the module-level functions above, or use directly for advanced use cases.

**Class Methods:**
- `register(layout_id, layout, ...)`: Register a layout
- `unregister(layout_id)`: Remove a registered layout
- `get_layout(layout_id)`: Get a specific layout definition
- `get_all_layouts()`: Get all registered layouts
- `get_layouts_metadata()`: Get metadata for all layouts (called by `init()`)
- `clear()`: Clear all registered layouts

## Size Variants

The component supports three size variants via CSS classes:

```css
/* Small */
.kaleido-size-sm

/* Medium (default) */
.kaleido-size-md

/* Large */
.kaleido-size-lg
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Run checks: `just check`
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

## Development

We use [Just](https://github.com/casey/just) as a command runner:

```bash
# Install dependencies
just install

# Build everything (JS + Python components)
just build

# Run TypeScript type checking
just typecheck

# Format code
just format

# Run example
just demo

# Watch mode for development
just watch
```

Or without Just:

```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Build
npm run build

# Run example
python usage.py
```

## License

Apache License 2.0 - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Built on [Plotly Dash](https://dash.plotly.com/)
- Inspired by modern tabbed interfaces
- CSS designed with CSS Custom Properties for easy theming

## Links

- **GitHub**: https://github.com/LudwigAJ/dash-kaleido
- **PyPI**: https://pypi.org/project/dash-kaleido/
- **Issues**: https://github.com/LudwigAJ/dash-kaleido/issues
- **Dash Community**: https://community.plotly.com/
