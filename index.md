
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

In the browser

```html
<script src="https://cdn.jsdelivr.net/npm/geoviz" charset="utf-8"></script>
```

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
<script src="https://cdn.jsdelivr.net/npm/geoviz@0.7.9" charset="utf-8"></script>
<script>
let geojson = "https://raw.githubusercontent.com/riatelab/geoviz/refs/heads/main/examples/world.json";
fetch(geojson)
   .then((res) => res.json())
   .then((data) => {
     let svg = geoviz.create({projection: "Bertin1953", zoomable: true });
     svg.outline()
     svg.graticule()
     svg.path({data: **a geoJSON**})
     svg.header({text : "Hello geoviz"})
     document.body.appendChild(svg.render());
    });
</script>
~~~

There are several ways to build maps with geoviz. Multiple syntaxes are possible. 

- **Classic**

~~~js
let svg = geoviz.create({projection: "Polar"})
geoviz.outline(svg, {fill: "#5abbe8"})
geoviz.graticule(svg, {stroke: "white", step: 30})
geoviz.path(svg, {data: **a geoJSON**, fill: "#38896F"})
geoviz.render(svg)
~~~

- **Light**

~~~js
let svg = geoviz.create({projection: "Polar"})
svg.outline({fill: "#5abbe8"})
svg.graticule({stroke: "white", step: 30})
svg.path({data: **a geoJSON**, fill: "#38896F"})
svg.render()
~~~

- **Plot**

~~~js
let svg = geoviz.create({projection: "Polar"})
svg.plot({type: "outline", fill: "#5abbe8"})
svg.plot({type: "graticule", stroke: "white", step: 30})
svg.plot({type:"path", data: **a geoJSON**, fill: "#38896F"})
svg.render()
~~~

- **Draw**

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

These functions are essential for initializing a map, visualizing its content, and exporting it. They form the core workflow for creating maps with the geoviz library.

- Create a geoviz map container : **`create()`** [![create](img/logo_doc.png)](global.html#create)
- Render the map : **`render()`** [![render](img/logo_doc.png)](global.html#render)
- Returns the map as a png file: **`exportPNG()`** [![exportPNG](img/logo_doc.png)](global.html#exportPNG)
- Returns the map as a sav file: **`exportSVG()`** [![exportSVG](img/logo_doc.png)](global.html#exportSVG)

# Base Map and Structure

Functions that define the map’s geographic content, including outlines, tiles, and graticules.

- Add a geoJSON: **`path()`** [![path](img/logo_doc.png)](global.html#path)
- Earth outline in the projection: **`outline()`** [![outline](img/logo_doc.png)](global.html#outline)
- graticule (latitude and longitude lines): **`graticule()`** [![graticule](img/logo_doc.png)](global.html#graticule)
- rhumb lines (loxodromes) **`rhumbs()`** [![rhumbs](img/logo_doc.png)](global.html#crerhumbsate)
- Tissot indicatrices: **`tissot()`** [![tissot](img/logo_doc.png)](global.html#tissot)
- Natural Earth: **`earth()`** [![earth](img/logo_doc.png)](global.html#earth)
- Mercator tiles: **`tile()`** [![tile](img/logo_doc.png)](global.html#tile)

# Map Decorations and Annotations

Functions for styling and annotating the map, such as titles, scale bars, and north arrows.

- Map title: **`header()`** [![header](img/logo_doc.png)](global.html#header)
- Source of the map: **`footer()`** [![footer](img/logo_doc.png)](global.html#footer)
- North arrow: **`north()`** [![north](img/logo_doc.png)](global.html#north)
- Scale bar: **`scalebar()`** [![scalebar](img/logo_doc.png)](global.html#pscalebarath)
- Texts and labels: **`text()`** [![text](img/logo_doc.png)](global.html#text)
- Location map: **`minimap()`** [![minimap](img/logo_doc.png)](global.html#minimap)
- Empty layer with id: **`empty()`** [![empty](img/logo_doc.png)](global.html#empty)

# Thematic

These functions allow the creation of thematic maps based on statistical data, complete with their associated legends.

## Examples

See [simple examples](https://riatelab.github.io/geoviz/examples/) & [code sources](https://github.com/riatelab/geoviz/tree/main/examples).

## Marks

The `geoviz` library provides several graphic marks that will allow you to draw your maps. circles, semi-circles, graticules, paths, scale, legends... Each mark has a specific function.

📚  **Map marks** [`path()`](global.html#path) [`circle()`](global.html#circle) [`square()`](global.html#square) [`halfcircle()`](global.html#halfcircle) [`spike()`](global.html#spike) [`tile()`](global.html#tile) [`smocontouroth()`](global.html#contour)

📚  **Layout marks** [`header()`](global.html#header) [`footer()`](global.html#footer) [`graticule()`](global.html#graticule) [`outline()`](global.html#outline) [`north()`](global.html#north) [`scalebar()`](global.html#scalebar) [`text()`](global.html#text) [`rhumbs()`](global.html#rhumbs) [`tissot()`](global.html#tissot)


📚  **Legend marks** [`legend.box()`](global.html#legend/box) [`legend.choro_horizontal()`](global.html#legend/choro_horizontal) [`legend.choro_vertical()`](global.html#legend/choro_vertical) [`legend.circles_half()`](global.html#legend/circles_half) [`legend.circles_nested()`](global.html#legend/circles_nested) [`legend.circles()`](global.html#legend/circles) [`legend.squares()`](global.html#legend/squares) [`legend.squares_nested()`](global.html#legend/squares_nested) [`legend.mushrooms()`](global.html#legend/mushrooms) [`legend.spikes()`](global.html#legend/spikes) [`legend.typo_horizontal()`](global.html#legend/typo_horizontal) [`legend.typo_vertical()`](global.html#legend/typo_vertical)

For example:

~~~js
// To display a geoJSON
geoviz.path({data: *a geoJSON*})
~~~

~~~js
// World graticule
geoviz.graticule({fill: "#267A8A"})
~~~

~~~js
// A legend for choropleth maps
geoviz.choro_horizontal({data: *an array of values*})
~~~

🌏 live demo [`path`](https://observablehq.com/@neocartocnrs/path-mark) [`circle`](https://observablehq.com/@neocartocnrs/circle-mark) [`square`](https://observablehq.com/@neocartocnrs/square-mark) [`halfcircle`](https://observablehq.com/@neocartocnrs/half-circle-mark) [`spike`](https://observablehq.com/@neocartocnrs/spike-mark) [`text`](https://observablehq.com/@neocartocnrs/text-mark) [`tile`](https://observablehq.com/@neocartocnrs/tile-mark) [`legends`](https://observablehq.com/@neocartocnrs/legends)

## Container and render

To combine several marks into a single representation, we need to create an SVG container, add layers and display the result. In the container, you can specify the map size, projection, margins, etc.

See [`create()`](global.html#create) [`render()`](global.html#render)

In Observable

~~~js
{
let world = await FileAttachment("world.json").json() // a geoJSON of world countries
let svg = geoviz.create({projection: d3.geoEqualEarth()}) // an SVG container
svg.outline({fill: "#267A8A"})
svg.graticule({stroke: "white", strokeWidth: 0.4})
svg.path({data: world, fill: "#F8D993", stroke: "#ada9a6", strokeWidth:0.5, tip:d => d.properties.NAMEen})
svg.header({fontSize: 30, text: "A Simple World Map", fill: "#267A8A", fontWeight: "bold", fontFamily: "Tangerine"})
return svg.render() // render
}
~~~

Same thing with Vanilla JavaScript

~~~js
let world =   "./world.json"  // a geoJSON of world countries
d3.json(world).then(data => {
let svg = geoviz.create({projection: d3.geoEqualEarth()}) // an SVG container
svg.outline({fill: "#267A8A"})
svg.graticule({stroke: "white", strokeWidth: 0.4})
svg.path({data: data, fill: "#F8D993", stroke: "#ada9a6", strokeWidth:0.5, tip:d => d.properties.NAMEen})
svg.header({fontSize: 30, text: "A Simple World Map", fill: "#267A8A", fontWeight: "bold", fontFamily: "Tangerine"})
document.body.appendChild(svg.render()) // render
})
~~~

🌏 live demo [`containers`](https://observablehq.com/@neocartocnrs/containers) [`insets`](https://observablehq.com/@neocartocnrs/insets)

## SVG filters

Design Attractive maps is important. That's why the geoviz library also lets you easily add SVG effects to your map.

📚  **Effects** [`effect.blur()`](global.html#effect/blur) [`effect.clipPath()`](global.html#effect/clipPath) [`effect.radialGradient()`](global.html#effect/radialGradient) [`effect.shadow()`](global.html#effect/shadow)

🌏 live demo [`effects`](https://observablehq.com/@neocartocnrs/effect) [`layout`](https://observablehq.com/@neocartocnrs/layout-marks)

## The plot function

The `plot()` function in allows you to call up all the layer types available in the library via a single function. It is the main function of the library. 

See [`plot()`](global.html#plot)

We can rewrite the previous example.

~~~js
{
let world = await FileAttachment("world.json").json() // a geoJSON of world countries
let svg = geoviz.create({projection: d3.geoEqualEarth()}) // an SVG container
svg.plot({type:"outline", fill: "#267A8A"})
svg.plot({type:"graticule", stroke: "white", strokeWidth: 0.4})
svg.plot({type:"path", data: world, fill: "#F8D993", stroke: "#ada9a6", strokeWidth:0.5, tip:d => d.properties.NAMEen})
svg.plot({type:"header", fontSize: 30, text: "A Simple World Map", fill: "#267A8A", fontWeight: "bold", fontFamily: "Tangerine"})
return svg.render() // render
}
~~~

## The draw function

The `draw()` function is inspired by the [`bertin`](https://observablehq.com/@neocartocnrs/hello-bertin-js?collection=@neocartocnrs/bertin) library. It allows you to draw the entire map using a single function. As in `bertin`, all the necessary information is stored in a single JSON, containing general parameters and an array of objects describing the layers to be displayed and overlaid. *Under the wood, the function draw() use the [`plot()`](https://riatelab.github.io/geoviz/global.html#plot) function.*

~~~js
geoviz.draw({
  layers: [
    { type: "outline", fill: "#267A8A"},
    { type: "graticule", stroke: "white", strokeWidth: 0.4 },
    { type: "layer", data: world, fill: "#F8D993", stroke: "#ada9a6", strokeWidth:0.5, tip:d => d.properties.NAMEen },
    {type: "header", fontSize: 30, text: "A Simple World Map", fill: "#267A8A", fontWeight: "bold", fontFamily: "Tangerine"}
  ]
})
~~~

## Statistical cartography

In addition of mapping static marks, the `plot()` and `draw()` functions lets you quickly create statistical maps (including legends) with very few parameters (and many others as options). Let's see some examples. 

### Proportional symbols

By using [`type = "prop"`](global.html#plot/prop), you can design a map with proportionnal symbols ("circle", "square", "halfcircle","spike"). Find below a minimal example.

~~~js
geoviz.plot({type = "prop", data = *a geoJSON*, var = *a field*})
~~~

📚  [`plot/prop()`](global.html#plot/prop)

🌏 live demo [`prop`](https://observablehq.com/@neocartocnrs/prop)

### Choropleth

By using [`type = "choro"`](global.html#plot/choro), you can design a choropleth map. Find below a minimal example.

~~~js
geoviz.plot({type = "choro", data = *a geoJSON*, var = *a field*})
~~~

📚  [`plot/choro()`](global.html#plot/choro)

🌏 live demo [`choropleth`](https://observablehq.com/@neocartocnrs/choropleth)

### Typology

By using [`type = "typo"`](global.html#plot/typo), you can design a qualitative typo map. Find below a minimal example.

~~~js
geoviz.plot({type = "typo", data = *a geoJSON*, var = *a field*})
~~~

📚 [`plot/typo()`](global.html#plot/typo)

🌏 live demo [`typology`](https://observablehq.com/@neocartocnrs/typo)


### Proportional symbols + choropleth

By using [`type = "propchoro"`](global.html#plot/propchoro), you can design a map with proportionnal symbols with graduated colors. Find below a minimal example.

~~~js
geoviz.plot({type = "propchoro", data = *a geoJSON*, var1 = *a field*, var2 = *a field*})
~~~

📚  [`plot/propchoro()`](global.html#plot/propchoro)

🌏 live demo [`prop`](https://observablehq.com/@neocartocnrs/prop)

### Proportional symbols + typology

By using [`type = "proptypo"`](global.html#plot/proptypo), you can design a map with proportionnal symbols with qualitative colors. Find below a minimal example.

~~~js
geoviz.plot({type = "proptypo", data = *a geoJSON*, var1 = *a field*, var2 = *a field*})
~~~

📚  [`plot/proptypo()`](global.html#plot/proptypo)

🌏 live demo [`prop`](https://observablehq.com/@neocartocnrs/prop)

## Interactivity

Maps created by geoviz are zoomable and interactive.

🌏 live demo [`tooltip`](https://observablehq.com/@neocartocnrs/tooltip) [`pan and zoom`](https://observablehq.com/@neocartocnrs/zooming) [`interactivity`](https://observablehq.com/@neocartocnrs/interactivity)

## Helpers

Finally, geoviz provides a toolbox of useful functions for cartography. 

📚 [`tool.addfonts()`](global.html#tool/addonts) [`tool/centroid()`](global.html#tool/centroid) [`tool.choro()`](global.html#tool/choro) [`tool.typo()`](global.html#tool/typo) [`tool.dissolve()`](global.html#tool/dissolve) [`tool.dodge()`](global.html#tool/dodge) [`tool.featurecollection()`](global.html#tool/featurecollection) [`tool.geotable()`](global.html#tool/geotable) [`tool.rewind()`](global.html#tool/rewind) [`tool.merge()`](global.html#tool/merge) [`tool.proj4d3()`](global.html#tool/proj4d3) [`tool.project()`](global.html#tool/project) [`tool.unproject()`](global.html#tool/unproject) [`tool.replicate()`](global.html#tool/replicate) [`tool.ridge()`](global.html#tool/ridge) [`tool.random()`](global.html#tool/random) [`tool.radius()`](global.html#tool/radius) 

🌏 live demo [`Handle geometries`](https://observablehq.com/@neocartocnrs/handle-geometries)
