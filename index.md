![npm](https://img.shields.io/npm/v/geoviz) ![jsdeliver](https://img.shields.io/jsdelivr/npm/hw/geoviz) ![license](https://img.shields.io/badge/license-MIT-success) ![code size](https://img.shields.io/github/languages/code-size/neocarto/geoviz) ![github stars](https://img.shields.io/github/stars/neocarto/geoviz?style=social)

# Geoviz JavaScript library

<img src = "img/logo.jpeg" width = 300></img>

`geoviz` is a JavaScript library for designing thematic maps. The library provides a set of [d3](https://github.com/d3/d3) compatible functions that you can mix with the usual d3 syntax. The library is designed to be intuitive and concise. It allow to manage different geographic layers (points, lines, polygons) and marks (circles, labels, scale bar, title, north arrow, etc.) to design pretty maps. Its use is particularly well suited to Observable notebooks. Maps deigned with `geoviz` are:

<img src="img/thematic.svg" style="height: 30px"/>  <img src="img/vectorial.svg" style="height: 30px"/> <img src="img/interactive.svg" style="height: 30px"/>  <img src="img/interoperable.svg" style="height: 30px"/> <img src="img/zoomable.svg" style="height: 30px"/>


🌏 live demo [`Observable notebook`](https://observablehq.com/@neocartocnrs/geoviz) [`simple map`](examples/simple.html) [`choropleth`](examples/choropleth.html) [`typology`](examples/typo.html) [`bubble`](examples/bubble.html) [`dorling`](examples/examples/dorling.html) [`Mercator tiles`](examples/examples/tiles.html) 





💻 Source code [`github`](https://github.com/riatelab/geoviz)

💡 Suggestions/bugs [`issues`](https://github.com/riatelab/geoviz/issues)

## Installation

In the browser

```html
<script src="https://cdn.jsdelivr.net/npm/geoviz" charset="utf-8"></script>
```

In [Observable](https://observablehq.com/) notebooks

~~~js
geoviz = require("geoviz")
~~~

## Marks

The `geoviz` library provides several graphic marks that will allow you to draw your maps. circles, semi-circles, graticules, paths, scale, legends... Each mark has a specific function.

👉 **Map marks** [`path()`](global.html#path) [`circle()`](global.html#circle) [`halfcircle()`](global.html#halfcircle) [`spike()`](global.html#spike) [`tile()`](global.html#tile)

👉 **Layout marks** [`header()`](global.html#header) [`footer()`](global.html#footer) [`graticule()`](global.html#graticule) [`outline()`](global.html#outline) [`north()`](global.html#north) [`scalebar()`](global.html#scalebar) [`text()`](global.html#text)

👉 **Legend marks** [`box()`](global.html#boxlegend) [`choro_horizontal()`](global.html#choro_horizontallegend) [`choro_vertical()`](global.html#choro_verticallegend) [`circles_half()`](global.html#circles_halflegend) [`circles_nested()`](global.html#circles_nestedlegend) [`circles()`](global.html#circleslegend) [`mushroom()`](global.html#mushroomlegend) [`spikes()`](global.html#spikeslegend) [`typo_horizontal()`](global.html#typo_horizontallegend) [`typo_vertical()`](global.html#typo_verticallegend)

👉 **Effects** [`blur()`](global.html#blur) [`clipPath()`](global.html#clipPath) [`radialGradient()`](global.html#radialGradient) [`shadow()`](global.html#shadow) 

For example:

~~~js
// To display a geoJSON
viz.path({data: *a geoJSON*})
~~~

~~~js
// World graticule
viz.graticule({fill: "#267A8A"})
~~~

~~~js
// A legend for choropleth maps
viz.choro_horizontal({data: *an array of values*})
~~~

🌏 live demo [`path`](https://observablehq.com/@neocartocnrs/path-mark) [`circle`](https://observablehq.com/@neocartocnrs/circle-mark) [`half-circle-mark`](https://observablehq.com/@neocartocnrs/half-circle-mark) [`spike`](https://observablehq.com/@neocartocnrs/spike-mark) [`text`](https://observablehq.com/@neocartocnrs/text-mark) [`tile`](https://observablehq.com/@neocartocnrs/tile-mark) [`legends`](https://observablehq.com/@neocartocnrs/legends) [`effects`](https://observablehq.com/@neocartocnrs/effect) [`layout`](https://observablehq.com/@neocartocnrs/layout-marks)

## Containers and renders

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

## Statistical cartography

In addition of mapping static marks, the plot function lets you quickly create statistical maps (including legends) with very few parameters (and many others as options). Let's see some examples. 

### 👉 **Choropleth**

By using [`type = "choro"`](global.html#plot_choro), you can design a choropleth map. Find below a minimal example.

~~~js
geoviz.plot({type = "choro", data = *a geoJSON*, var = *a field*})
~~~

🌏 live demo [`choropleth`](https://observablehq.com/@neocartocnrs/choropleth)

## Interactivity

Maps created by geoviz are zoomable and interactive.

🌏 live demo [`tooltip`](https://observablehq.com/@neocartocnrs/tooltip) [`pan and zoom`](https://observablehq.com/@neocartocnrs/zooming) [`interactivity`](https://observablehq.com/@neocartocnrs/interactivity)




## Helpers

Finally, geoviz provides a toolbox of useful functions for cartography. 

See [`addfonts()`](global.html#addfonts) [`centroid()`](global.html#centroid) [`choro()`](global.html#choro) [`typo()`](global.html#typo) [`dissolve()`](global.html#dissolve) [`dodge()`](global.html#dodge) [`featurecollection()`](global.html#featurecollection) [`geotable()`](global.html#geotable) [`rewind()`](global.html#rewind) [`merge()`](global.html#merge) [`proj4d3()`](global.html#proj4d3) [`project()`](global.html#project) [`unproject()`](global.html#unproject) [`replicate()`](global.html#replicate) [`ridge()`](global.html#ridge) [`random()`](global.html#random) [`radius()`](global.html#radius) 

🌏 live demo [`Handle geometries`](https://observablehq.com/@neocartocnrs/handle-geometries)


<!-- **1 - Simple map**

~~~js
let geojson =   "./world.json"
d3.json(geojson).then(data => {
let svg = geoviz.create({projection: d3.geoEqualEarth()})
svg.outline({fill: "#267A8A"})
svg.graticule({stroke: "white", strokeWidth: 0.4})
svg.path({data: data, fill: "#F8D993", stroke: "#ada9a6", strokeWidth:0.5, tip:d => d.properties.NAMEen})
svg.header({fontSize: 30, text: "A Simple World Map", fill: "#267A8A", fontWeight: "bold", fontFamily: "Tangerine"})
document.body.appendChild(svg.render())
})
~~~

Demo: [simple.html](https://neocarto.github.io/geoviz/examples/simple.html)

**2 - Circles**

~~~js
let geojson =   "./world.json"
d3.json(geojson).then(data => {
let svg = geoviz.create({projection: d3.geoEqualEarth()})
svg.path({datum: data, fill: "white", fillOpacity:0.4})
svg.circle({data: data, r: "pop", fill: "#f07d75"})
document.body.appendChild(svg.render())
})

~~~

Demo: [bubble.html](https://neocarto.github.io/geoviz/examples/bubble.html) & [dorling.html](https://neocarto.github.io/geoviz/examples/dorling.html)

**3 - Choropleth**

~~~js
let geojson =   "./world.json"
d3.json(geojson).then(data => {
let svg = geoviz.create({projection: d3.geoEqualEarth()})
let choro = geoviz.tool.choro(data.features.map((d) => d.properties.gdppc), {method: "quantile", colors: "Matter"})
svg.path({data: data, fill: d =>  choro.colorize(d.properties.gdppc), stroke: "white", strokeWidth:0.5})
document.body.appendChild(svg.render())
})
~~~

Demo: [choropleth.html](https://neocarto.github.io/geoviz/examples/choropleth.html)

**4 - Typology**

~~~js
let geojson =   "./world.json"

d3.json(geojson).then(data => {
let svg = geoviz.create({projection: d3.geoEqualEarth()})
let typo = geoviz.tool.typo(data.features.map((d) => d.properties.region), {colors: "Set3"});
svg.path({data: data, fill: (d) => typo.colorize(d.properties.region), stroke: "white", strokeWidth:0.5})
document.body.appendChild(svg.render())
})
~~~

Demo: [typo.html](https://neocarto.github.io/geoviz/examples/typo.html)

**5 - Zoomable tiles**

~~~js
let geojson =   "./world.json"
d3.json(geojson).then(data => {
let svg = geoviz.create({projection:"mercator", zoomable:true})
svg.tile({url: (x, y, z) =>
        `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}.png`
    })
document.body.appendChild(svg.render())
})
~~~

Demo: [tiles.html](https://neocarto.github.io/geoviz/examples/tiles.html) -->