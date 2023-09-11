# Geoviz JavaScript library

`geoviz` is a d3-based JavaScript library for designing thematic maps. The library provides a set of [d3](https://github.com/d3/d3) compatible functions that you can mix with the usual d3 syntax. In [Observable](https://observablehq.com/), this library allows you to split map layers into different cells.

## Installation

In the browser

```html
<script src="https://cdn.jsdelivr.net/npm/geoviz" charset="utf-8"></script>
```

In Observable

~~~js
viz = require("geoviz")
~~~

### Usage

1 - Simple map

~~~js
let svg = container.create({width: 500})
svg.layer.datum({
  data: world,
  fill: "#CCC",
})
return svg.render();
~~~

2 - Bubbles

~~~js
let svg = container.create({width: 500})
// basemap
svg.layer.datum(main, {
  data: world,
  fill: "#CCC",
})
// bubbles
svg.layer.bubble(main, {
  data: transform.centroid(world, {largest: true}),
  r: "population",
  fill: "red",
})
return svg.render();
~~~

3 - Choropleth

~~~js
let svg = container.create({width: 500})
// classification
let classif = classify.choro(world.features.map((d) => d.properties.population), {method: "jenks})
// Choro layer
svg.geo({
  data: world,
  fill: d => classif.colorize(d => d.properties.population),
})
return svg.render();
~~~

### Live Examples

You can find several live examples of how to use the library on the observable platform - [observablehq.com/collection/@neocartocnrs/geoviz](https://observablehq.com/collection/@neocartocnrs/bertin)

### Api documentation

See https://neocarto.github.io/geoviz
