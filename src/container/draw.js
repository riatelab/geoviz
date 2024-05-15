import { create } from "./create";
import { geoEquirectangular } from "d3-geo";
const d3 = Object.assign({}, { geoEquirectangular });

/**
 * @function draw
 * @description The `draw` function is inspired by the [`bertin`](https://observablehq.com/@neocartocnrs/hello-bertin-js?collection=@neocartocnrs/bertin) library. It allows you to draw the entire map using a single function. If you like the `bertin` lib, you'll like this function. As in `bertin`, all the necessary information is stored in a single JSON file, containing general parameters and a table describing the layers to be displayed and overlaid.
 * @see {@link https://observablehq.com/@neocartocnrs/geoviz-draw}
 *
 * @property {object} [json] - a objection containing params et layers

 *
 * @example
 * geoviz.draw({
  params: {
    zoomable: true
    //projection: d3.geoNaturalEarth1()
    //domain: world
    //   margin: 100
  },
  layers: [
    { type: "outline" },
    { type: "graticule", stroke: "white", step: 30, strokeWidth: 2 },
    //{ type: "tile" },
    { type: "base", data: world },
    {
      type: "prop",
      data: world,
      symbol: "circle",
      var: "gdp",
      symbol: "square",
      tip: true,
      //leg_type: "extended",
      leg_values_factor: 1 / 1000000000
    },
    { type: "base", data: aus },
    { type: "base", data: aus_roads, tip: true },
    { type: "text", data: aus_roads, text: "type" },
    { type: "header", text: "Carte du monde" }
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
  } else if (layertypes.includes("outline") && params.projection == undefined) {
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
