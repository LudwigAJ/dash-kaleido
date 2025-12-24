"""
Dash Kaleido - Showcase Example

This example demonstrates impressive layouts using Plotly Express datasets:
- Static layouts (immediate): Home, Settings
- Lazy/callback layouts (on-demand): Data visualizations with real datasets
"""

from dash import Dash, html, dcc, callback, Input, Output, State
import dash_kaleido
import plotly.express as px
import plotly.graph_objects as go

# Create the Dash app
app = Dash(__name__, suppress_callback_exceptions=True)

# =============================================================================
# STATIC LAYOUTS (delivered immediately, no callback needed)
# =============================================================================

# Home Layout - Welcome page
dash_kaleido.register_layout(
    layout_id='home',
    name='Home',
    description='Welcome page with getting started guide',
    keywords=['welcome', 'intro', 'start', 'home'],
    
    layout=html.Div([
        html.Div([
            html.H1('Welcome to Dash Kaleido!', 
                   style={'fontSize': '2.5rem', 'marginBottom': '10px'}),
            html.P('A powerful tab management system for Plotly Dash applications',
                  style={'fontSize': '1.2rem', 'color': '#666', 'marginBottom': '30px'}),
        ], style={'textAlign': 'center', 'marginBottom': '40px'}),
        
        html.Div([
            html.Div([
                html.Div('[Charts]', style={'fontSize': '2rem', 'marginBottom': '15px', 'color': '#1976d2'}),
                html.H3('Rich Visualizations'),
                html.P('Explore interactive charts using Plotly Express with real datasets like Gapminder, Iris, and more.')
            ], style={'flex': 1, 'padding': '30px', 'textAlign': 'center', 
                     'backgroundColor': '#f8f9fa', 'borderRadius': '12px', 'margin': '10px'}),
            
            html.Div([
                html.Div('[Tabs]', style={'fontSize': '2rem', 'marginBottom': '15px', 'color': '#1976d2'}),
                html.H3('Tab Management'),
                html.P('Create, rename, reorder, and close tabs. Your layout persists across sessions.')
            ], style={'flex': 1, 'padding': '30px', 'textAlign': 'center', 
                     'backgroundColor': '#f8f9fa', 'borderRadius': '12px', 'margin': '10px'}),
            
            html.Div([
                html.Div('[Fast]', style={'fontSize': '2rem', 'marginBottom': '15px', 'color': '#1976d2'}),
                html.H3('Lazy Loading'),
                html.P('Layouts are loaded on-demand for optimal performance. Static or callback-based.')
            ], style={'flex': 1, 'padding': '30px', 'textAlign': 'center', 
                     'backgroundColor': '#f8f9fa', 'borderRadius': '12px', 'margin': '10px'}),
        ], style={'display': 'flex', 'justifyContent': 'center', 'flexWrap': 'wrap', 'marginBottom': '40px'}),
        
        html.Div([
            html.H3('Quick Start'),
            html.P('Click the + button above to add a new tab, then select a layout to explore.'),
            html.P('Double-click a tab name to rename it. Right-click for more options.'),
            html.P('Drag tabs to reorder them.'),
        ], style={'backgroundColor': '#e3f2fd', 'padding': '25px', 'borderRadius': '12px', 
                 'maxWidth': '600px', 'margin': '0 auto'})
    ], style={'padding': '40px', 'maxWidth': '1200px', 'margin': '0 auto'})
)

# Settings Layout - Static configuration page
dash_kaleido.register_layout(
    layout_id='settings',
    name='Settings',
    description='Application settings and preferences',
    keywords=['config', 'preferences', 'options', 'settings'],
    
    layout=html.Div([
        html.H1('Settings', style={'marginBottom': '30px'}),
        
        html.Div([
            html.Div([
                html.H3('Appearance'),
                html.Label('Theme:', style={'fontWeight': 'bold', 'display': 'block', 'marginBottom': '8px'}),
                dcc.Dropdown(
                    id='theme-dropdown',
                    options=[
                        {'label': 'Light', 'value': 'light'},
                        {'label': 'Dark', 'value': 'dark'},
                    ],
                    value='light',
                    persistence=True,
                    persistence_type='local',
                    style={'maxWidth': '300px'}
                )
            ], style={'marginBottom': '30px', 'padding': '25px', 
                     'backgroundColor': '#f8f9fa', 'borderRadius': '12px'}),
            
            html.Div([
                html.H3('Notifications'),
                dcc.Checklist(
                    id='notifications-checklist',
                    options=[
                        {'label': ' Email notifications', 'value': 'email'},
                        {'label': ' Push notifications', 'value': 'push'},
                        {'label': ' Sound alerts', 'value': 'sound'},
                    ],
                    value=['email'],
                    persistence=True,
                    persistence_type='local',
                    style={'display': 'flex', 'flexDirection': 'column', 'gap': '10px'}
                )
            ], style={'marginBottom': '30px', 'padding': '25px', 
                     'backgroundColor': '#f8f9fa', 'borderRadius': '12px'}),
            
            html.Div([
                html.H3('Data Settings'),
                html.Label('Default Chart Type:', style={'fontWeight': 'bold', 'display': 'block', 'marginBottom': '8px'}),
                dcc.RadioItems(
                    id='default-chart-type',
                    options=[
                        {'label': ' Bar Chart', 'value': 'bar'},
                        {'label': ' Line Chart', 'value': 'line'},
                        {'label': ' Scatter Plot', 'value': 'scatter'},
                    ],
                    value='bar',
                    persistence=True,
                    persistence_type='local',
                    inline=True,
                    style={'display': 'flex', 'gap': '20px'}
                )
            ], style={'padding': '25px', 'backgroundColor': '#f8f9fa', 'borderRadius': '12px'}),
        ], style={'maxWidth': '600px'})
    ], style={'padding': '40px'})
)


# =============================================================================
# LAZY LAYOUTS (loaded on-demand via callbacks)
# =============================================================================

# Gapminder World Data - Animated bubble chart
@dash_kaleido.register_layout_callback(
    layout_id='gapminder',
    name='World Data',
    description='Explore global life expectancy, GDP, and population with Gapminder data',
    keywords=['gapminder', 'world', 'countries', 'gdp', 'population', 'life expectancy'],
    
)
def gapminder_layout():
    df = px.data.gapminder()
    
    fig = px.scatter(
        df.query("year==2007"), 
        x="gdpPercap", 
        y="lifeExp", 
        size="pop", 
        color="continent",
        hover_name="country", 
        log_x=True, 
        size_max=60,
        title="Life Expectancy vs GDP per Capita (2007)"
    )
    fig.update_layout(height=500)
    
    # Animated version
    fig_animated = px.scatter(
        df, 
        x="gdpPercap", 
        y="lifeExp", 
        animation_frame="year", 
        animation_group="country",
        size="pop", 
        color="continent", 
        hover_name="country",
        log_x=True, 
        size_max=55, 
        range_x=[100, 100000], 
        range_y=[25, 90],
        title="Gapminder: 60 Years of Global Development"
    )
    fig_animated.update_layout(height=500)
    
    return html.Div([
        html.H1('Gapminder World Data', style={'marginBottom': '20px'}),
        html.P('Explore how life expectancy, GDP, and population have changed across countries and continents.'),
        
        dcc.Graph(figure=fig),
        
        html.Hr(style={'margin': '30px 0'}),
        
        html.H3('Animated Timeline'),
        html.P('Press play to see how the world has changed from 1952 to 2007.'),
        dcc.Graph(figure=fig_animated),
    ], style={'padding': '20px'})


# Iris Dataset - Scatter Matrix
@dash_kaleido.register_layout_callback(
    layout_id='iris',
    name='Iris Analysis',
    description='Machine learning classic: Iris flower dataset visualization',
    keywords=['iris', 'flowers', 'ml', 'machine learning', 'scatter', 'species'],
    
)
def iris_layout():
    df = px.data.iris()
    
    # Scatter matrix
    fig_matrix = px.scatter_matrix(
        df,
        dimensions=["sepal_width", "sepal_length", "petal_width", "petal_length"],
        color="species",
        title="Iris Dataset - Scatter Matrix"
    )
    fig_matrix.update_layout(height=600)
    
    # 3D scatter
    fig_3d = px.scatter_3d(
        df, 
        x='sepal_length', 
        y='sepal_width', 
        z='petal_length',
        color='species',
        symbol='species',
        title='Iris Dataset - 3D View'
    )
    fig_3d.update_layout(height=500)
    
    # Parallel coordinates
    fig_parallel = px.parallel_coordinates(
        df, 
        color="species_id",
        labels={"species_id": "Species", "sepal_width": "Sepal Width", 
                "sepal_length": "Sepal Length", "petal_width": "Petal Width", 
                "petal_length": "Petal Length"},
        color_continuous_scale=px.colors.diverging.Tealrose,
        title="Parallel Coordinates"
    )
    fig_parallel.update_layout(height=400)
    
    return html.Div([
        html.H1('Iris Flower Analysis', style={'marginBottom': '20px'}),
        html.P('The classic machine learning dataset with 150 iris flowers from three species.'),
        
        html.Div([
            html.Div([
                html.H4('Setosa'),
                html.P('50 samples', style={'color': '#666'})
            ], style={'flex': 1, 'textAlign': 'center', 'padding': '15px', 
                     'backgroundColor': '#e8f5e9', 'borderRadius': '8px', 'margin': '5px'}),
            html.Div([
                html.H4('Versicolor'),
                html.P('50 samples', style={'color': '#666'})
            ], style={'flex': 1, 'textAlign': 'center', 'padding': '15px', 
                     'backgroundColor': '#fff3e0', 'borderRadius': '8px', 'margin': '5px'}),
            html.Div([
                html.H4('Virginica'),
                html.P('50 samples', style={'color': '#666'})
            ], style={'flex': 1, 'textAlign': 'center', 'padding': '15px', 
                     'backgroundColor': '#fce4ec', 'borderRadius': '8px', 'margin': '5px'}),
        ], style={'display': 'flex', 'marginBottom': '20px'}),
        
        dcc.Graph(figure=fig_matrix),
        
        html.Div([
            html.Div([dcc.Graph(figure=fig_3d)], style={'flex': 1}),
        ]),
        
        dcc.Graph(figure=fig_parallel),
    ], style={'padding': '20px'})


# Restaurant Tips Analysis
@dash_kaleido.register_layout_callback(
    layout_id='tips',
    name='Restaurant Tips',
    description='Analyze tipping patterns in restaurant data',
    keywords=['tips', 'restaurant', 'money', 'dining', 'analysis'],
    
)
def tips_layout():
    df = px.data.tips()
    
    # Main scatter
    fig_scatter = px.scatter(
        df, x="total_bill", y="tip", color="day", size="size",
        hover_data=['sex', 'smoker', 'time'],
        title="Tips vs Total Bill"
    )
    fig_scatter.update_layout(height=450)
    
    # Box plot by day
    fig_box = px.box(
        df, x="day", y="total_bill", color="smoker", notched=True,
        title="Bill Distribution by Day",
        category_orders={"day": ["Thur", "Fri", "Sat", "Sun"]}
    )
    fig_box.update_layout(height=400)
    
    # Violin plot
    fig_violin = px.violin(
        df, y="tip", x="day", color="sex", box=True, points="all",
        title="Tip Distribution by Day and Gender",
        category_orders={"day": ["Thur", "Fri", "Sat", "Sun"]}
    )
    fig_violin.update_layout(height=400)
    
    # Sunburst
    fig_sunburst = px.sunburst(
        df, path=['day', 'time', 'sex'], values='total_bill',
        title="Bill Breakdown: Day -> Time -> Gender"
    )
    fig_sunburst.update_layout(height=450)
    
    return html.Div([
        html.H1('Restaurant Tips Analysis', style={'marginBottom': '20px'}),
        html.P('Analyze 244 restaurant bills and their associated tips.'),
        
        html.Div([
            html.Div([
                html.H2(f"${df['total_bill'].sum():.0f}"),
                html.P('Total Bills')
            ], style={'flex': 1, 'textAlign': 'center', 'padding': '20px', 
                     'backgroundColor': '#e3f2fd', 'borderRadius': '12px', 'margin': '10px'}),
            html.Div([
                html.H2(f"${df['tip'].sum():.0f}"),
                html.P('Total Tips')
            ], style={'flex': 1, 'textAlign': 'center', 'padding': '20px', 
                     'backgroundColor': '#e8f5e9', 'borderRadius': '12px', 'margin': '10px'}),
            html.Div([
                html.H2(f"{(df['tip'].sum() / df['total_bill'].sum() * 100):.1f}%"),
                html.P('Avg Tip Rate')
            ], style={'flex': 1, 'textAlign': 'center', 'padding': '20px', 
                     'backgroundColor': '#fff8e1', 'borderRadius': '12px', 'margin': '10px'}),
        ], style={'display': 'flex', 'marginBottom': '20px'}),
        
        dcc.Graph(figure=fig_scatter),
        
        html.Div([
            html.Div([dcc.Graph(figure=fig_box)], style={'flex': 1}),
            html.Div([dcc.Graph(figure=fig_violin)], style={'flex': 1}),
        ], style={'display': 'flex', 'gap': '10px'}),
        
        dcc.Graph(figure=fig_sunburst),
    ], style={'padding': '20px'})


# Stock Market Data
@dash_kaleido.register_layout_callback(
    layout_id='stocks',
    name='Stock Market',
    description='Tech stock performance visualization',
    keywords=['stocks', 'finance', 'market', 'trading', 'tech'],
    
)
def stocks_layout():
    df = px.data.stocks()
    
    # Line chart
    fig_line = px.line(
        df, x='date', y=['GOOG', 'AAPL', 'AMZN', 'FB', 'NFLX', 'MSFT'],
        title="Tech Stocks Performance (2018-2019)",
        labels={'value': 'Price (Normalized)', 'variable': 'Company'}
    )
    fig_line.update_layout(height=450, hovermode='x unified')
    
    # Area chart
    fig_area = px.area(
        df, x='date', y=['GOOG', 'AAPL', 'AMZN'],
        title="GOOG, AAPL, AMZN - Stacked Area"
    )
    fig_area.update_layout(height=400)
    
    # Calculate returns
    returns = df.set_index('date').pct_change().dropna()
    fig_heatmap = px.imshow(
        returns.corr(),
        text_auto=True,
        title="Stock Correlation Matrix",
        color_continuous_scale='RdBu_r'
    )
    fig_heatmap.update_layout(height=400)
    
    return html.Div([
        html.H1('Stock Market Analysis', style={'marginBottom': '20px'}),
        html.P('Analyze tech stock performance from 2018-2019.'),
        
        html.Div([
            html.Div([
                html.H3('GOOG'),
                html.P(f"+{((df['GOOG'].iloc[-1] / df['GOOG'].iloc[0]) - 1) * 100:.1f}%", 
                      style={'color': '#4CAF50', 'fontSize': '1.5rem', 'fontWeight': 'bold'})
            ], style={'flex': 1, 'textAlign': 'center', 'padding': '15px', 
                     'backgroundColor': '#f5f5f5', 'borderRadius': '8px', 'margin': '5px'}),
            html.Div([
                html.H3('AAPL'),
                html.P(f"+{((df['AAPL'].iloc[-1] / df['AAPL'].iloc[0]) - 1) * 100:.1f}%",
                      style={'color': '#4CAF50', 'fontSize': '1.5rem', 'fontWeight': 'bold'})
            ], style={'flex': 1, 'textAlign': 'center', 'padding': '15px', 
                     'backgroundColor': '#f5f5f5', 'borderRadius': '8px', 'margin': '5px'}),
            html.Div([
                html.H3('AMZN'),
                html.P(f"+{((df['AMZN'].iloc[-1] / df['AMZN'].iloc[0]) - 1) * 100:.1f}%",
                      style={'color': '#4CAF50', 'fontSize': '1.5rem', 'fontWeight': 'bold'})
            ], style={'flex': 1, 'textAlign': 'center', 'padding': '15px', 
                     'backgroundColor': '#f5f5f5', 'borderRadius': '8px', 'margin': '5px'}),
        ], style={'display': 'flex', 'marginBottom': '20px'}),
        
        dcc.Graph(figure=fig_line),
        
        html.Div([
            html.Div([dcc.Graph(figure=fig_area)], style={'flex': 1}),
            html.Div([dcc.Graph(figure=fig_heatmap)], style={'flex': 1}),
        ], style={'display': 'flex', 'gap': '10px'}),
    ], style={'padding': '20px'})


# Wind Rose / Polar Charts
@dash_kaleido.register_layout_callback(
    layout_id='wind',
    name='Wind Analysis',
    description='Wind patterns visualization with polar charts',
    keywords=['wind', 'weather', 'polar', 'direction', 'meteorology'],
    
)
def wind_layout():
    df = px.data.wind()
    
    # Wind rose
    fig_rose = px.bar_polar(
        df, r="frequency", theta="direction", color="strength",
        template="plotly_dark",
        color_discrete_sequence=px.colors.sequential.Plasma_r,
        title="Wind Rose Chart"
    )
    fig_rose.update_layout(height=500)
    
    # Line polar
    fig_line = px.line_polar(
        df, r="frequency", theta="direction", color="strength",
        line_close=True,
        color_discrete_sequence=px.colors.sequential.Plasma_r,
        title="Wind Patterns by Direction"
    )
    fig_line.update_layout(height=450)
    
    # Scatter polar
    fig_scatter = px.scatter_polar(
        df, r="frequency", theta="direction", color="strength",
        symbol="strength",
        color_discrete_sequence=px.colors.sequential.Plasma_r,
        title="Wind Scatter Plot"
    )
    fig_scatter.update_layout(height=450)
    
    return html.Div([
        html.H1('Wind Pattern Analysis', style={'marginBottom': '20px'}),
        html.P('Visualize wind direction and strength using polar charts.'),
        
        dcc.Graph(figure=fig_rose),
        
        html.Div([
            html.Div([dcc.Graph(figure=fig_line)], style={'flex': 1}),
            html.Div([dcc.Graph(figure=fig_scatter)], style={'flex': 1}),
        ], style={'display': 'flex', 'gap': '10px'}),
    ], style={'padding': '20px'})


# Montreal Elections - Ternary & 3D
@dash_kaleido.register_layout_callback(
    layout_id='elections',
    name='Elections',
    description='2013 Montreal mayoral election results visualization',
    keywords=['election', 'voting', 'politics', 'montreal', 'ternary'],
    
)
def elections_layout():
    df = px.data.election()
    
    # Ternary plot
    fig_ternary = px.scatter_ternary(
        df, a="Joly", b="Coderre", c="Bergeron",
        color="winner", size="total", hover_name="district",
        size_max=15,
        color_discrete_map={"Joly": "blue", "Bergeron": "green", "Coderre": "red"},
        title="Montreal 2013 Election - Ternary Plot"
    )
    fig_ternary.update_layout(height=500)
    
    # 3D scatter
    fig_3d = px.scatter_3d(
        df, x="Joly", y="Coderre", z="Bergeron",
        color="winner", size="total", hover_name="district",
        symbol="result",
        color_discrete_map={"Joly": "blue", "Bergeron": "green", "Coderre": "red"},
        title="Election Results - 3D View"
    )
    fig_3d.update_layout(height=500)
    
    # Bar chart of winners
    winner_counts = df['winner'].value_counts().reset_index()
    winner_counts.columns = ['Candidate', 'Districts Won']
    fig_bar = px.bar(
        winner_counts, x='Candidate', y='Districts Won',
        color='Candidate',
        color_discrete_map={"Joly": "blue", "Bergeron": "green", "Coderre": "red"},
        title="Districts Won by Candidate"
    )
    fig_bar.update_layout(height=350)
    
    return html.Div([
        html.H1('Montreal 2013 Mayoral Election', style={'marginBottom': '20px'}),
        html.P('Visualize how 58 electoral districts voted for three candidates.'),
        
        html.Div([
            html.Div([
                html.H3('Denis Coderre', style={'color': 'red'}),
                html.P(f"{(df['winner'] == 'Coderre').sum()} districts")
            ], style={'flex': 1, 'textAlign': 'center', 'padding': '15px', 
                     'backgroundColor': '#ffebee', 'borderRadius': '8px', 'margin': '5px'}),
            html.Div([
                html.H3('Richard Bergeron', style={'color': 'green'}),
                html.P(f"{(df['winner'] == 'Bergeron').sum()} districts")
            ], style={'flex': 1, 'textAlign': 'center', 'padding': '15px', 
                     'backgroundColor': '#e8f5e9', 'borderRadius': '8px', 'margin': '5px'}),
            html.Div([
                html.H3('Melanie Joly', style={'color': 'blue'}),
                html.P(f"{(df['winner'] == 'Joly').sum()} districts")
            ], style={'flex': 1, 'textAlign': 'center', 'padding': '15px', 
                     'backgroundColor': '#e3f2fd', 'borderRadius': '8px', 'margin': '5px'}),
        ], style={'display': 'flex', 'marginBottom': '20px'}),
        
        html.Div([
            html.Div([dcc.Graph(figure=fig_ternary)], style={'flex': 2}),
            html.Div([dcc.Graph(figure=fig_bar)], style={'flex': 1}),
        ], style={'display': 'flex', 'gap': '10px'}),
        
        dcc.Graph(figure=fig_3d),
    ], style={'padding': '20px'})


# =============================================================================
# PARAMETERIZED LAYOUTS (layouts that accept user input)
# =============================================================================

# Custom Greeting - A simple example with required parameter
@dash_kaleido.register_layout_callback(
    layout_id='greeting',
    name='Custom Greeting',
    description='A personalized greeting page - requires your name',
    keywords=['greeting', 'hello', 'welcome', 'personalized', 'name'],
    
)
def greeting_layout(name):
    """Layout that requires a name parameter."""
    return html.Div([
        html.H1(f'Hello, {name}!', 
               style={'fontSize': '3rem', 'textAlign': 'center', 'marginTop': '60px', 
                     'background': 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                     'WebkitBackgroundClip': 'text',
                     'WebkitTextFillColor': 'transparent'}),
        html.P(f'Welcome to your personalized dashboard.',
              style={'fontSize': '1.3rem', 'textAlign': 'center', 'color': '#666', 
                    'marginTop': '20px'}),
        html.Div([
            html.Div([
                html.P('🎉', style={'fontSize': '4rem', 'marginBottom': '10px'}),
                html.P('Your custom layout is ready!')
            ], style={'textAlign': 'center', 'padding': '40px', 
                     'backgroundColor': '#f0f4ff', 'borderRadius': '16px',
                     'maxWidth': '400px', 'margin': '40px auto'})
        ])
    ], style={'padding': '40px'})


# Country Explorer - Example with required and optional parameters
@dash_kaleido.register_layout_callback(
    layout_id='country-explorer',
    name='Country Explorer',
    description='Explore data for a specific country from Gapminder dataset',
    keywords=['country', 'explore', 'gapminder', 'custom', 'filter'],
    allow_multiple=True,
)
def country_explorer_layout(country, year='2007'):
    """
    Layout that shows data for a specific country.
    
    Parameters
    ----------
    country : str
        The country name to explore (required)
    year : str
        The year to show data for (default: 2007)
    """
    df = px.data.gapminder()
    
    # Try to find the country (case-insensitive)
    country_match = df[df['country'].str.lower() == country.lower()]
    
    if country_match.empty:
        # Show error with suggestions
        all_countries = sorted(df['country'].unique())
        suggestions = [c for c in all_countries if country.lower() in c.lower()][:5]
        return html.Div([
            html.H2(f'Country "{country}" not found', style={'color': '#e74c3c'}),
            html.P('Did you mean one of these?'),
            html.Ul([html.Li(c) for c in suggestions]) if suggestions else html.P('No similar countries found.'),
            html.Hr(),
            html.P('Available countries:'),
            html.P(', '.join(all_countries[:20]) + '...')
        ], style={'padding': '40px'})
    
    country_name = country_match['country'].iloc[0]
    country_data = df[df['country'] == country_name]
    
    # Try to get the specified year
    try:
        year_int = int(year)
    except ValueError:
        year_int = 2007
    
    # Get the closest available year
    available_years = sorted(country_data['year'].unique())
    closest_year = min(available_years, key=lambda x: abs(x - year_int))
    year_data = country_data[country_data['year'] == closest_year].iloc[0]
    
    # Create figures
    fig_timeline = px.line(
        country_data, x='year', y=['lifeExp', 'gdpPercap'],
        title=f'{country_name}: Life Expectancy & GDP Over Time',
        labels={'value': 'Value', 'variable': 'Metric'}
    )
    fig_timeline.update_layout(height=350)
    
    fig_pop = px.bar(
        country_data, x='year', y='pop',
        title=f'{country_name}: Population Over Time',
        color='pop', color_continuous_scale='Blues'
    )
    fig_pop.update_layout(height=300, showlegend=False)
    
    return html.Div([
        html.H1(f'🌍 {country_name}', style={'marginBottom': '10px'}),
        html.P(f'Data from Gapminder dataset • Showing year {closest_year}', 
              style={'color': '#666', 'marginBottom': '30px'}),
        
        # Key metrics
        html.Div([
            html.Div([
                html.H3('Life Expectancy'),
                html.P(f'{year_data["lifeExp"]:.1f} years', 
                      style={'fontSize': '2rem', 'fontWeight': 'bold', 'color': '#3498db'})
            ], style={'flex': 1, 'padding': '20px', 'backgroundColor': '#e3f2fd', 
                     'borderRadius': '12px', 'textAlign': 'center'}),
            html.Div([
                html.H3('GDP per Capita'),
                html.P(f'${year_data["gdpPercap"]:,.0f}', 
                      style={'fontSize': '2rem', 'fontWeight': 'bold', 'color': '#27ae60'})
            ], style={'flex': 1, 'padding': '20px', 'backgroundColor': '#e8f5e9', 
                     'borderRadius': '12px', 'textAlign': 'center'}),
            html.Div([
                html.H3('Population'),
                html.P(f'{year_data["pop"]:,}', 
                      style={'fontSize': '2rem', 'fontWeight': 'bold', 'color': '#9b59b6'})
            ], style={'flex': 1, 'padding': '20px', 'backgroundColor': '#f3e5f5', 
                     'borderRadius': '12px', 'textAlign': 'center'}),
        ], style={'display': 'flex', 'gap': '20px', 'marginBottom': '30px'}),
        
        dcc.Graph(figure=fig_timeline),
        dcc.Graph(figure=fig_pop),
    ], style={'padding': '20px'})


# Continent Comparison - Example with parameter_options (pre-defined configurations)
@dash_kaleido.register_layout_callback(
    layout_id='continent-comparison',
    name='Continent Comparison',
    description='Compare life expectancy across countries in a continent',
    keywords=['continent', 'comparison', 'gapminder', 'life expectancy', 'preset'],
    
    parameter_options={
        'africa': ('Africa - 52 countries', {'continent': 'Africa', 'metric': 'lifeExp'}),
        'americas': ('Americas - 25 countries', {'continent': 'Americas', 'metric': 'lifeExp'}),
        'asia': ('Asia - 33 countries', {'continent': 'Asia', 'metric': 'lifeExp'}),
        'europe': ('Europe - 30 countries', {'continent': 'Europe', 'metric': 'lifeExp'}),
        'oceania': ('Oceania - 2 countries', {'continent': 'Oceania', 'metric': 'lifeExp'}),
    }
)
def continent_comparison_layout(continent, metric='lifeExp'):
    """
    Layout showing comparison of countries within a continent.
    Uses parameter_options so users select from pre-defined configurations.
    
    Parameters
    ----------
    continent : str
        The continent to display
    metric : str
        The metric to compare (default: lifeExp)
    """
    df = px.data.gapminder()
    
    # Filter to continent and latest year
    continent_df = df[(df['continent'] == continent) & (df['year'] == 2007)]
    continent_df = continent_df.sort_values(metric, ascending=True)
    
    metric_labels = {
        'lifeExp': 'Life Expectancy (years)',
        'gdpPercap': 'GDP per Capita ($)',
        'pop': 'Population'
    }
    
    # Create bar chart
    fig_bar = px.bar(
        continent_df, y='country', x=metric,
        orientation='h',
        color=metric,
        color_continuous_scale='Viridis',
        title=f'{continent}: {metric_labels.get(metric, metric)} by Country (2007)',
        labels={metric: metric_labels.get(metric, metric)}
    )
    fig_bar.update_layout(height=max(400, len(continent_df) * 25))
    
    # Create scatter for continent over time (animated)
    all_years = df[df['continent'] == continent]
    fig_scatter = px.scatter(
        all_years, x='gdpPercap', y='lifeExp',
        size='pop', color='country',
        hover_name='country',
        animation_frame='year',
        animation_group='country',
        title=f'{continent}: GDP vs Life Expectancy Over Time',
        log_x=True,
        size_max=60
    )
    fig_scatter.update_layout(height=500)
    
    # Stats
    avg_life = continent_df['lifeExp'].mean()
    avg_gdp = continent_df['gdpPercap'].mean()
    total_pop = continent_df['pop'].sum()
    
    return html.Div([
        html.H1(f'🌍 {continent}', style={'marginBottom': '10px'}),
        html.P(f'{len(continent_df)} countries • Data from Gapminder', 
              style={'color': '#666', 'marginBottom': '30px'}),
        
        # Summary stats
        html.Div([
            html.Div([
                html.H4('Avg. Life Expectancy'),
                html.P(f'{avg_life:.1f} years', 
                      style={'fontSize': '1.8rem', 'fontWeight': 'bold', 'color': '#3498db'})
            ], style={'flex': 1, 'padding': '15px', 'backgroundColor': '#e3f2fd', 
                     'borderRadius': '10px', 'textAlign': 'center'}),
            html.Div([
                html.H4('Avg. GDP per Capita'),
                html.P(f'${avg_gdp:,.0f}', 
                      style={'fontSize': '1.8rem', 'fontWeight': 'bold', 'color': '#27ae60'})
            ], style={'flex': 1, 'padding': '15px', 'backgroundColor': '#e8f5e9', 
                     'borderRadius': '10px', 'textAlign': 'center'}),
            html.Div([
                html.H4('Total Population'),
                html.P(f'{total_pop:,.0f}', 
                      style={'fontSize': '1.8rem', 'fontWeight': 'bold', 'color': '#9b59b6'})
            ], style={'flex': 1, 'padding': '15px', 'backgroundColor': '#f3e5f5', 
                     'borderRadius': '10px', 'textAlign': 'center'}),
        ], style={'display': 'flex', 'gap': '15px', 'marginBottom': '30px'}),
        
        dcc.Graph(figure=fig_bar),
        dcc.Graph(figure=fig_scatter),
    ], style={'padding': '20px'})


# Car Sharing Map
@dash_kaleido.register_layout_callback(
    layout_id='carshare',
    name='Car Sharing',
    description='Montreal car-sharing service locations map',
    keywords=['map', 'cars', 'sharing', 'montreal', 'transportation', 'geo'],
    
)
def carshare_layout():
    df = px.data.carshare()
    
    # Scatter map
    fig_map = px.scatter_map(
        df, lat="centroid_lat", lon="centroid_lon",
        color="peak_hour", size="car_hours",
        color_continuous_scale=px.colors.cyclical.IceFire,
        size_max=15, zoom=10,
        map_style="carto-positron",
        title="Car Sharing Availability in Montreal"
    )
    fig_map.update_layout(height=600)
    
    # Histogram
    fig_hist = px.histogram(
        df, x="peak_hour", nbins=24,
        title="Peak Hours Distribution",
        labels={'peak_hour': 'Hour of Day', 'count': 'Number of Zones'}
    )
    fig_hist.update_layout(height=300)
    
    # Scatter
    fig_scatter = px.scatter(
        df, x="peak_hour", y="car_hours", color="car_hours",
        color_continuous_scale="Viridis",
        title="Car Hours by Peak Hour"
    )
    fig_scatter.update_layout(height=300)
    
    return html.Div([
        html.H1('Montreal Car Sharing', style={'marginBottom': '20px'}),
        html.P(f'Explore {len(df)} car-sharing zones across Montreal.'),
        
        dcc.Graph(figure=fig_map),
        
        html.Div([
            html.Div([dcc.Graph(figure=fig_hist)], style={'flex': 1}),
            html.Div([dcc.Graph(figure=fig_scatter)], style={'flex': 1}),
        ], style={'display': 'flex', 'gap': '10px'}),
    ], style={'padding': '20px'})


# =============================================================================
# APP LAYOUT
# =============================================================================

app.layout = html.Div([
    # KaleidoManager takes the full height
    html.Div([
        dash_kaleido.KaleidoManager(
            id='kaleido',
            displayedLayouts=['home', 'gapminder', 'iris', 'tips', 'stocks', 'wind', 'elections', 'carshare', 'greeting', 'country-explorer', 'continent-comparison', 'settings'],
            initialTab='home',
            theme='light',
            contentOverflow='auto',
            searchBarConfig={
                'show': True,
                'placeholder': 'What would you like the power to do?',
                'position': 'under',
                'showDropdownInNewTab': True,  # Show dropdown instead of filtering cards in New Tab
            },
            enableStatusBar=True,  # Show status bar at bottom
            persistence=True,
            persistence_type='local',
            maxTabs=12,
        )
    ], style={
        'display': 'flex',
        'flexDirection': 'column',
        'flex': '1',
        'minHeight': 0,
        'width': '100%',
        'boxSizing': 'border-box',
        'overflow': 'hidden'
    })
], style={
    'fontFamily': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    'position': 'fixed',
    'top': 0,
    'left': 0,
    'right': 0,
    'bottom': 0,
    'display': 'flex',
    'flexDirection': 'column',
    'margin': 0,
    'padding': 0,
    'overflow': 'hidden'
})

# Initialize Kaleido
dash_kaleido.init(app, 'kaleido')


# =============================================================================
# CALLBACKS
# =============================================================================

# Update theme from settings
@callback(
    Output('kaleido', 'theme'),
    Input('theme-dropdown', 'value'),
    prevent_initial_call=True
)
def update_theme(theme):
    return theme


if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("Dash Kaleido - Showcase Example")
    print("=" * 60)
    print("Open http://127.0.0.1:8050 in your browser")
    print("\nAvailable Layouts:")
    print("  Home            - Welcome & getting started")
    print("  World Data      - Gapminder (animated)")
    print("  Iris Analysis   - ML classic dataset")
    print("  Restaurant      - Tips analysis")
    print("  Stock Market    - Tech stocks")
    print("  Wind Analysis   - Polar charts")
    print("  Elections       - Ternary & 3D")
    print("  Car Sharing     - Map visualization")
    print("  Settings        - App configuration")
    print("\nParameterized Layouts (require input):")
    print("  Custom Greeting   - Enter your name for a personalized page")
    print("  Country Explorer  - Explore data for any country")
    print("=" * 60 + "\n")
    
    app.run(debug=False, port=8050)
