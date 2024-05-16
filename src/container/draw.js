import { create } from "./create";
import { geoEquirectangular } from "d3-geo";
const d3 = Object.assign({}, { geoEquirectangular });

/**
 * @function draw
 * @description The `draw()` function is inspired by the [`bertin`](https://observablehq.com/@neocartocnrs/hello-bertin-js?collection=@neocartocnrs/bertin) library. It allows you to draw the entire map using a single function. All the necessary information is stored in a single JSON, containing general parameters and an array of objects describing the layers to be displayed and overlaid. *Under the wood, the function draw() use the [`viz.plot()`](https://riatelab.github.io/geoviz/global.html#plot) function.* The types available are the same.
 * @see {@link https://observablehq.com/@neocartocnrs/geoviz-draw}
 * @property {object} json - an object containing container parameters and an array for layers description. See example below. 
 * @example
 * geoviz.draw({
 // SVG container parameters
  params: {
    zoomable: true,
    projection: d3.geoNaturalEarth1()
  },
 // Layers description
  layers: [
    { type: "outline" },
    { type: "graticule", stroke: "white", step: 30, strokeWidth: 2 },
    { type: "base", datum: world, fill: "white", fillOpacity: 0.3 },
    {
      type: "prop",
      data: world,
      symbol: "circle",
      var: "gdp",
      fill: "red",
      tip: true,
      leg_values_factor: 1 / 1000000000,
      leg_title: "Gross Domestic Product"
    },
    { type: "header", text: "World Wealth" }
  ]
})
 */

export function draw(json) {
  let params = json?.params || {};
  // layer types
  let layertypes = json.layers.map((d) => d.type);
  // projection
  if (layertypes.includes("tile")) {
    params.projection = "mercator";
    if (params.zoomable == undefined) {
      params.zoomable = true;
    }
  } else if (
    (layertypes.includes("outline") || layertypes.includes("graticule")) &&
    params.projection == undefined
  ) {
    params.projection = d3.geoEquirectangular();
  }
  // Domain
  if (!params?.domain && !json.layers.map((d) => d.type).includes("outline")) {
    params.domain = [];
    json.layers.map((d) => {
      params.domain.push(d?.data || d?.datum);
    });
    params.domain = Array.isArray(params.domain)
      ? params.domain.filter((d) => d != undefined)
      : params.domain;
  }
  params.domain = params.domain == "outline" ? undefined : params.domain;
  let svg = create(params);
  json.layers.forEach((d) => {
    svg.plot(d);
  });
  return svg.render();
}
