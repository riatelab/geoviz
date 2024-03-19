![npm](https://img.shields.io/npm/v/geoviz) ![jsdeliver](https://img.shields.io/jsdelivr/npm/hw/geoviz) ![license](https://img.shields.io/badge/license-MIT-success) ![code size](https://img.shields.io/github/languages/code-size/neocarto/geoviz) ![github stars](https://img.shields.io/github/stars/neocarto/geoviz?style=social)

# Geoviz JavaScript library

<img src = "img/logo.jpeg" width = 300></img>

**Tags** `#cartography` `#maps` `#geoviz` `#dataviz` `#JSspatial` `#Observable` `#FrontEndCartography`  

`geoviz` is a JavaScript library for designing thematic maps. The library provides a set of [d3](https://github.com/d3/d3) compatible functions that you can mix with the usual d3 syntax. The library is designed to be intuitive and concise. It allow to manage different geographic layers (points, lines, polygons) and marks (circles, labels, scale bar, title, north arrow, etc.) to design pretty maps. Its use is particularly well suited to Observable notebooks. Maps deigned with `geoviz` are:

<img src="img/thematic.svg" style="height: 30px"/>  <img src="img/vectorial.svg" style="height: 30px"/> <img src="img/interactive.svg" style="height: 30px"/>  <img src="img/interoperable.svg" style="height: 30px"/> <img src="img/zoomable.svg" style="height: 30px"/>

🌏 live demo [`Observable notebook`](https://observablehq.com/@neocartocnrs/geoviz) [`simple map`](examples/simple.html) [`choropleth`](examples/choropleth.html) [`typology`](examples/typo.html) [`bubble`](examples/bubble.html) [`dorling`](examples/dorling.html) [`Mercator tiles`](examples/tiles.html) 

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

📚  **Map marks** [`path()`](global.html#path) [`circle()`](global.html#circle) [`halfcircle()`](global.html#halfcircle) [`spike()`](global.html#spike) [`tile()`](global.html#tile)

📚  **Layout marks** [`header()`](global.html#header) [`footer()`](global.html#footer) [`graticule()`](global.html#graticule) [`outline()`](global.html#outline) [`north()`](global.html#north) [`scalebar()`](global.html#scalebar) [`text()`](global.html#text)

📚  **Legend marks** [`legend.box()`](global.html#legend/box) [`legend.choro_horizontal()`](global.html#legend/choro_horizontal) [`legend.choro_vertical()`](global.html#legend/choro_vertical) [`legend.circles_half()`](global.html#legend/circles_half) [`legend.circles_nested()`](global.html#legend/circles_nested) [`legend.circles()`](global.html#legend/circles) [`legend.mushrooms()`](global.html#legend/mushrooms) [`legend.spikes()`](global.html#legend/spikes) [`legend.typo_horizontal()`](global.html#legend/typo_horizontal) [`legend.typo_vertical()`](global.html#legend/typo_vertical)

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

🌏 live demo [`path`](https://observablehq.com/@neocartocnrs/path-mark) [`circle`](https://observablehq.com/@neocartocnrs/circle-mark) [`halfcircle`](https://observablehq.com/@neocartocnrs/half-circle-mark) [`spike`](https://observablehq.com/@neocartocnrs/spike-mark) [`text`](https://observablehq.com/@neocartocnrs/text-mark) [`tile`](https://observablehq.com/@neocartocnrs/tile-mark) [`legends`](https://observablehq.com/@neocartocnrs/legends)

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

## Statistical cartography

In addition of mapping static marks, the plot function lets you quickly create statistical maps (including legends) with very few parameters (and many others as options). Let's see some examples. 

### Proportional symbols

By using [`type = "prop"`](global.html#plot/prop), you can design a map with proportionnal symbols. Find below a minimal example.

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
