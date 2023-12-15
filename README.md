![npm](https://img.shields.io/npm/v/geoviz) ![jsdeliver](https://img.shields.io/jsdelivr/npm/hw/geoviz) ![license](https://img.shields.io/badge/license-MIT-success) ![code size](https://img.shields.io/github/languages/code-size/neocarto/geoviz) ![github stars](https://img.shields.io/github/stars/neocarto/geoviz?style=social)

# Geoviz JavaScript library

<img src = "img/logo.jpeg" width = 300></img>



`geoviz` is a d3-based JavaScript library for designing thematic maps. The library provides a set of [d3](https://github.com/d3/d3) compatible functions that you can mix with the usual d3 syntax. In [Observable](https://observablehq.com/), this library allows you to split map layers into different cells.

## Installation

In the browser

```html
<script src="https://cdn.jsdelivr.net/npm/geoviz" charset="utf-8"></script>
```

In Observable

~~~js
geoviz = require("geoviz")
~~~

## Documentation

- [Documentation](https://observablehq.com/@neocartocnrs/geoviz)
- [API reference](https://neocarto.github.io/geoviz/docs)

## Usage

**1 - Simple map**

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
let choro = geoviz.tool.choro(data.features.map((d) => d.properties.gdppc), {method: "quantile", palette: "Matter"})
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
let typo = geoviz.tool.typo(data.features.map((d) => d.properties.region), {palette: "Set3"});
svg.path({data: data, fill: (d) => typo.colorize(d.properties.region), stroke: "white", strokeWidth:0.5})
document.body.appendChild(svg.render())
})
~~~

Demo: [typo.html](https://neocarto.github.io/geoviz/examples/typo.html)

**5 - Zoomable tiles**

~~~js
let geojson =   "./world.json"
d3.json(geojson).then(data => {
let svg = geoviz.create({projection: d3.geoMercator(), zoomable:true})
svg.tile({url: (x, y, z) =>
        `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}.png`
    })
document.body.appendChild(svg.render())
})
~~~

Demo: [tiles.html](https://neocarto.github.io/geoviz/examples/tiles.html)