import { create } from "../container/create";
import { render } from "../container/render";
import { geoCircle, geoPath, geoNaturalEarth1 } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoCircle, geoNaturalEarth1 });

/**
 * @function tissot
 * @description The `tissot` function aims to draw Tissot circles to visualize the deformations due to the projection
 * @see {@link https://observablehq.com/@neocartocnrs/https://observablehq.com/@neocartocnrs/map-projections}
 *
 * @property {number} [step = 20] - step between circles
 * @property {string} [id] - id of the layer
 * @property {string} [fill = "red"] - fill color.
 * @property {string} [stroke = "white"] - stroke color.
 * @property {number} [strokeOpacity = 0.5] - stroke color.
 * @property {*} [*] - *other SVG attributes that can be applied (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @property {*} [svg_*]  - *parameters of the svg container created if the layer is not called inside a container (e.g svg_width)*
 * @example
 * // There are several ways to use this function
 * geoviz.tissot(svg, { step: 25 }) // where svg is the container
 * svg.tissot({ step: 25 }) // where svg is the container
 * svg.plot({ type: "tissot", step: 25 }) // where svg is the container
 * geoviz.tissot({ step: 25 }) // no container
 */

export function tissot(arg1, arg2) {
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  let options = newcontainer ? arg1 : arg2;
  // Default values
  let opts = {
    mark: "tissot",
    step: 20,
    fill: "red",
    fillOpacity: 0.5,
    stroke: "white",
  };
  opts = { ...opts, ...options };
  opts.datum = regularcircles(opts.step);
  let ids = `#${opts.id}`;
  let svg = newcontainer ? create({ projection: d3.geoNaturalEarth1() }) : arg1;
  svg.path(opts);
  if (newcontainer) {
    return render(svg);
  } else {
    return ids;
  }
}

// Create circles
function regularcircles(step) {
  const circle = d3
    .geoCircle()
    .center((d) => d)
    .radius(step / 4)
    .precision(10);
  const features = [];
  for (let y = -80; y <= 80; y += step) {
    for (let x = -180; x < 180; x += step) {
      features.push({
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiPolygon",
          coordinates: [circle([x, y]).coordinates],
        },
      });
    }
  }

  return { type: "FeatureCollection", features: features };
}
