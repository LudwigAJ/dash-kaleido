# Dash Kaleido

**Powerful tab management for Dash applications**

Dash Kaleido provides an advanced tab management system for Plotly Dash, allowing users to dynamically create, organize, and manage multiple tabs with different layouts. Perfect for building complex dashboards and multi-view applications.

## Features

- **Multiple Themes** - Choose from 7 built-in themes (light, dark, arctic, ocean, forest, desert, highcontrast)
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

```bash
pip install dash-kaleido
```

Or install from source:

```bash
git clone https://github.com/LudwigAJ/dash-kaleido.git
cd dash-kaleido
npm install
npm run build
pip install -e .
```

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
| `theme` | string | `'light'` | Theme: light, dark, arctic, ocean, forest, desert, highcontrast |
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

Dash Kaleido includes 7 beautiful themes with CSS custom properties for easy customization:

```python
# Light theme (default)
theme='light'

# Dark theme
theme='dark'

# Arctic theme (cool blues)
theme='arctic'

# Ocean theme (teals)
theme='ocean'

# Forest theme (greens)
theme='forest'

# Desert theme (warm yellows)
theme='desert'

# High Contrast theme (maximum readability)
theme='highcontrast'
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

```python
app.layout = html.Div([dash_kaleido.KaleidoManager(id='kaleido', ...)])
dash_kaleido.init(app, 'kaleido')
```

#### `register_layout(layout_id, name, description, keywords, layout)`

Register a static layout for use in KaleidoManager.

```python
dash_kaleido.register_layout(
    layout_id='about',
    name='About',
    description='About page',
    keywords=['about', 'info'],
    layout=html.Div([html.H1('About')])
)
```

#### `@register_layout_callback(...)`

Decorator to register a callable/lazy layout.

```python
@dash_kaleido.register_layout_callback(
    layout_id='dashboard',
    name='Dashboard',
    description='Main dashboard',
    keywords=['main'],
    allow_multiple=False,
    parameter_options=None
)
def dashboard_layout():
    return html.Div([html.H1('Dashboard')])
```

**Parameters:**
- `layout_id` (str): Unique identifier
- `name` (str, optional): Display name
- `description` (str, optional): Description text
- `keywords` (list, optional): Search keywords
- `allow_multiple` (bool): Allow multiple tabs with this layout
- `parameter_options` (dict, optional): Pre-defined parameter configurations

#### `render_layout_for_tab(active_tab_data)`

Helper to render the correct layout for a tab (for custom callbacks).

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

#### `get_registered_layouts_metadata()`

Get metadata for all registered layouts.

**Returns:** Dictionary of layout metadata

### Classes

#### `KaleidoManager`

The main React component for tab management.

#### `KaleidoTab`

Wrapper component for tab content (internal use, created by `init()`).

#### `LayoutRegistry`

Global registry for layouts.

**Methods:**
- `register(layout_id, layout, ...)`: Register a layout
- `unregister(layout_id)`: Remove a layout
- `get_layout(layout_id)`: Get a specific layout

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

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development

```bash
# Install dependencies
npm install
pip install -r requirements.txt

# Build JavaScript
npm run build

# Run example
python usage.py
```

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Built on [Plotly Dash](https://dash.plotly.com/)
- Inspired by modern tabbed interfaces
- CSS designed with CSS Custom Properties for easy theming

## Links

- **GitHub**: https://github.com/LudwigAJ/dash-kaleido
- **PyPI**: https://pypi.org/project/dash-kaleido/
- **Issues**: https://github.com/LudwigAJ/dash-kaleido/issues
- **Dash Community**: https://community.plotly.com/
