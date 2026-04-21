
![npm](https://img.shields.io/npm/v/geoviz) ![jsdeliver](https://img.shields.io/jsdelivr/npm/hw/geoviz) ![license](https://img.shields.io/badge/license-MIT-success) ![code size](https://img.shields.io/github/languages/code-size/neocarto/geoviz) ![github stars](https://img.shields.io/github/stars/neocarto/geoviz?style=social)

# Geoviz JavaScript library

<img src = "img/logo.jpeg" width = 300></img>

**Tags** `#cartography` `#maps` `#geoviz` `#dataviz` `#JSspatial` `#Observable` `#FrontEndCartography`  

`geoviz` is a JavaScript library for designing thematic maps. The library provides a set of [d3](https://github.com/d3/d3) compatible functions that you can mix with the usual d3 syntax. The library is designed to be intuitive and concise. It allow to manage different geographic layers (points, lines, polygons) and marks (circles, labels, scale bar, title, north arrow, etc.) to design pretty maps. Its use is particularly well suited to Observable notebooks. Maps deigned with `geoviz` are:

<img src="img/thematic.svg" style="height: 30px"/>  <img src="img/vectorial.svg" style="height: 30px"/> <img src="img/interactive.svg" style="height: 30px"/>  <img src="img/interoperable.svg" style="height: 30px"/> <img src="img/zoomable.svg" style="height: 30px"/>

🌏 live demo [`Observable notebook`](https://observablehq.com/@neocartocnrs/geoviz)

💻 Source code [`github`](https://github.com/riatelab/geoviz)

💡 Suggestions/bugs [`issues`](https://github.com/riatelab/geoviz/issues)

<img src = "img/banner.png" width = 100%></img>


# Installation

In the browser (CDN, global variable)

```html
<script src="https://cdn.jsdelivr.net/npm/geoviz" charset="utf-8"></script>
```

In the browser (ES modules)

~~~js
<script type="module">
import * as geoviz from "https://cdn.jsdelivr.net/npm/geoviz/+esm";
</script>
~~~

With a bundler (Vite, Webpack, etc.)

~~~js
npm install geoviz
~~~

In [Observable](https://observablehq.com/) notebooks

~~~js
geoviz = require("geoviz")
~~~




# Examples

To see what can be done with the geoviz library, many examples have been developed on the Observable platform. Click on the image below to access them.

<a href = "https://observablehq.com/@neocartocnrs/geoviz" target = "_BLANK"><img src = "img/observable.png" width = 100%></img></a>

# Syntax

There are several steps involved in creating a map with geoviz.

**1** - First, create the map container using the `create()` function. This is where you define the projection, margins, background color, etc. In short, all the general parameters of the map.

**2** The next step is to progressively add layers. A set of dedicated functions is available for this purpose. For instance, `path` adds a spatial dataframe, `graticule` draws latitude and longitude lines, `header` inserts a title, and `footer` adds a source note.

**3** - Then, the `render()` function displays the map

For example:

~~~js
let svg = geoviz.create({projection: "Bertin1953", zoomable: true})
svg.outline()
svg.graticule()
svg.path({data: **a geoJSON**})
svg.header({text : "Hello geoviz"})
svg.render()
~~~

Here's an example that works in vanilla JS. Copy this code into an `.html` file and open it in your web browser.

~~~js
<script type="module">
  import * as geoviz from "https://cdn.jsdelivr.net/npm/geoviz/+esm";
  let geojson =
    "https://raw.githubusercontent.com/riatelab/geoviz/refs/heads/main/examples/world.json";
  fetch(geojson)
    .then((res) => res.json())
    .then((data) => {
      let svg = geoviz.create({ projection: "Bertin1953", zoomable: true });
      svg.outline();
      svg.graticule();
      svg.path({ data: data });
      svg.header({ text: "Hello geoviz" });
      document.body.appendChild(svg.render());
    });
</script>
~~~

There are several ways to build maps with geoviz. Multiple syntaxes are possible. 

**Classic style** 

~~~js
let svg = geoviz.create({projection: "Polar"})
geoviz.outline(svg, {fill: "#5abbe8"})
geoviz.graticule(svg, {stroke: "white", step: 30})
geoviz.path(svg, {data: **a geoJSON**, fill: "#38896F"})
geoviz.render(svg)
~~~

**Light style**

~~~js
let svg = geoviz.create({projection: "Polar"})
svg.outline({fill: "#5abbe8"})
svg.graticule({stroke: "white", step: 30})
svg.path({data: **a geoJSON**, fill: "#38896F"})
svg.render()
~~~

**With the `plot()` function**

~~~js
let svg = geoviz.create({projection: "Polar"})
svg.plot({type: "outline", fill: "#5abbe8"})
svg.plot({type: "graticule", stroke: "white", step: 30})
svg.plot({type:"path", data: **a geoJSON**, fill: "#38896F"})
svg.render()
~~~

**With the `draw()` function**

~~~js
geoviz.draw({
  params: { projection: "Polar" },
  layers: [
    { type: "outline", fill: "#5abbe8" },
    { type: "graticule", stroke: "white", step: 30 },
    { type: "path", data: **a geoJSON**, fill: "#38896F" }
  ]
});
~~~

Use whichever one you prefer.

# Create & render

**These functions are essential for initializing a map, visualizing its content, and exporting it. They form the core workflow for creating maps with the geoviz library.**dd

- Create a geoviz map container : **`create()`** [![create](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#create)
- Render the map : **`render()`** [![render](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#render)
- Returns the map as a png file: **`exportPNG()`** [![exportPNG](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#exportPNG)
- Returns the map as a sav file: **`exportSVG()`** [![exportSVG](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#exportSVG)

# Base Map and Structure

**Functions that define the map’s geographic content, including outlines, tiles, and graticules.**

- Add a geoJSON: **`path()`** [![path](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#path)
- Earth outline in the projection: **`outline()`** [![outline](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#outline)
- graticule (latitude and longitude lines): **`graticule()`** [![graticule](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#graticule)
- rhumb lines (loxodromes) **`rhumbs()`** [![rhumbs](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#crerhumbsate)
- Tissot indicatrices: **`tissot()`** [![tissot](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#tissot)
- Natural Earth: **`earth()`** [![earth](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#earth)
- Mercator tiles: **`tile()`** [![tile](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#tile)

# Map Decorations and Annotations

**Functions for styling and annotating the map, such as titles, scale bars, and north arrows.**

- Map title: **`header()`** [![header](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#header)
- Source of the map: **`footer()`** [![footer](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#footer)
- North arrow: **`north()`** [![north](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#north)
- Scale bar: **`scalebar()`** [![scalebar](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#pscalebarath)
- Texts and labels: **`text()`** [![text](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#text)
- Location map: **`minimap()`** [![minimap](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#minimap)
- Empty layer with id: **`empty()`** [![empty](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#empty)
- Pattern layer: **`pattern()`** [![pattern](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#pattern)
- Sketch layer: **`sketch()`** [![sketch](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#sketch)

# Thematic

**These functions allow the creation of thematic maps based on statistical data, complete with their associated legends.**

- Proportional symbols layer: **`prop()`** [![prop](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#hepropader)
- Choropleth layer: **`choro()`** [![choro](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#heachoroder)
- Typology layer: **`typo()`** [![typo](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#typo)
- Proportional + choropleth combined layer: **`propchoro()`** [![propchoro](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#propchoro)
- Proportional + typology combined layer: **`proptypo()`** [![proptypo](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#proptypo)
- Pictogram layer: **`picto()`** [![picto](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#picto)

# Thematic (advanced)

**These functions allow the creation of advanced thematic maps based on statistical data, complete with their associated legends.**

- Grid-based proportional symbols layer: **`gridprop()`** [![gridprop](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#gridprop)
- Grid-based choropleth layer: **`gridchoro()`** [![gridchoro](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#gridchoro)
- Smoothed density (isobands) layer: **`smooth()`** [![smooth](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#smooth)
- Dot density layer: **`dotdensity()`** [![dotdensity](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#dotdensity)

# Marks

**Behind the symbolization functions, there are elementary graphical marks. In geoviz, it is possible to use them directly.**

- Circle layer: **`circle()`** [![circle](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#circle)
- Square layer: **`square()`** [![square](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#square)
- Spike layer: **`spike()`** [![spike](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#spike)
- Half-circle layer: halfcircle()`** [![halfcircle](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#halfcircle)
- Symbol layer: **`symbol()`** [![symbol](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#symbol)

# Effects

**Since the maps created are in SVG format, it is possible to apply filters to them. These functions offer four different options for doing so.**

- Shadow effect: **`effect.shadow()`** [![shadow](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#effect/shadow)
- Blur effect: **`effect.blur()`** [![blur](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#effect/blur)
- ClipPath layer: **`effect.clipPath()`** [![clipPath](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#effect/clipPath)
- Radial gradient: **`effect.radialGradient()`** [![radialGradient](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#effect/radialGradient)

# Legends

**Functions to design map legends.**

- Add a box legend: **`legend.box()`** [![box](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#effect/box)
- Add a vertical typology legend: **`legend.typo_vertical()`** [![typo_vertical](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/typo_vertical)
- Add a horizontal typology legend: **`legend.typo_horizontal()`** [![typo_horizontal](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/shadtypo_horizontalow)
- Add a horizontal choropleth legend: **`legend.choro_horizontal()`** [![choro_horizontal](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/choro_horizontal)
- Add a vertical choropleth legend: **`legend.choro_vertical()`** [![choro_vertical](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/choro_vertical)
- Add a vertical gradient legend: **`legend.gradient_vertical()`** [![gradient_vertical](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/gradient_vertical)
- Add a spike legend: **`legend.spikes()`** [![shadow](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/shadow)
- Add a proportional circles legend: **`legend.circles()`** [![circles](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/circles)
- Add a nested proportional circles legend: **`legend.circles_nested()`** [![circles_nested](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/circles_nested)
- Add a proportional squares legend: **`legend.squares()`** [![squares](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/squares)
- Add a proportional nested squares legend: **`legend.squares_nested()`** [![squares_nested](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/squares_nested)
- Add a proportional half-circles (mushrooms) legend: **`legend.mushrooms()`** [![mushrooms](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/mushrooms)
- Add a vertical symbol legend: **`legend.symbol_vertical()`** [![symbol_vertical](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/symbol_vertical)
- Add a symbol horizontal legend: **`legend.symbol_horizontal()`** [![symbol_horizontal](img/logo_doc.png)](https://riatelab.github.io/geoviz/global.html#legend/symbol_horizontal)

# Tools

**Geoviz also provides many functions that allow you to manipulate data.**

- The **`tool.random()`** function returns a random color among 20 predefined colors.
- The **`tool.addonts()`** function allows add font to the document from an url.
- The **`tool.radius()`** function return a function to calculate radius of circles from data
- **`tool.merge()`** is a function to join a geoJSON and a data file. It returns a GeoJSON FeatureCollection.
- The **`tool.unproject()`** function allow to unproject geometries. It returns a GeoJSON FeatureCollection with wgs84 coordinates
- **`tool.featurecollection()`** is a function to create a valid GeoJSON FeatureCollection, from geometries, features or coordinates. It returns a GeoJSON FeatureCollection.
- The **`tool.centroid()`** function calculate the centroid of all the geometries given in a GeoJSON FeatureCollection. It returns a GeoJSON FeatureCollection (points)
- The **`tool.dissolve()`** function aims to transform multi part features into single parts feature. It a GeoJSON FeatureCollection (without multi part features)
- The **`tool.ridge()`** function convert a regular grid (x,y,z) to a GeoJSON FeatureCollection (LineString). The aim is to draw a rideline map.
- The **`tool.choro()`** function discretizes an array of numbers. It returns an object containing breaks, colors, the color of the missing value and a function.
- The **`tool.typo()`** function allows you to assign colors to qualitative data. It can be used to create typology maps. It returs an object containing types, colors, the color of the missing value and a function.
- The **`tool.grid()`** function creates a regular grid as a GeoJSON object. For all grid types (except "h3"), the function returns a GeoJSON with SVG coordinates in page layout. For type "h3", it returns geographic coordinates (latitude and longitude).
- The **`tool.dodge()`** function use d3.forceSimulation to spread dots or circles of given in a GeoJSON FeatureCollection (points). It returns the coordinates in the page map. It can be used to create a dorling cartogram. The function returns a GeoJSON FeatureCollection (points) with coordinates in the page map.
- **`tool.dotstogrid()`** is a function to create a regular grid in the SVG plan count the number of dots inside
- **`tool.geotable()`** is a function to create an array on objects containing properties and geomeytries, froam a GeoJSON FeatureCollection. This makes it easy to sort, extract data, etc. tool.featurecollection(geotable, { geometry: "geometry" }) can be used to rebuild a valid geoJSON. The function returns an array of an array of FeatureCollections.
- The **`tool.height()`** function return a function to calculate radius of circles from data. It returns an object containing a radius function.
- **`tool.proj4d3()`** is a function developped by Philippe Rivière to allow tu use proj4js projections with d3. It returns a d3js projection function.
- The function **`tool.project()`** use geoproject from d3-geo-projection to project a geoJSON. It returns a GeoJSON FeatureCollection with coordinates in the page map.
- The function **`tool.randompoints()`** renerates random points inside polygons or multipolygons using a dot-density approach. Each point is returned as a valid GeoJSON Feature with properties containing { geom_id, data, var, id }.
- The function **`tool.replicate()`** can be used to create "dots cartograms". The function returns a GeoJSON FeatureCollection with overlapping features

See also: https://riatelab.github.io/geotoolbox & https://neocarto.github.io/geogrid


















<hr/>

Geoviz is also available in R language. See: https://riatelab.github.io/geoviz_R

