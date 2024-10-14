import { square } from "./square.js";
import { dot } from "./dot.js";
import { diamond } from "./diamond.js";
import { arbitrary } from "./arbitrary.js";
import { hexbin } from "./hexbin.js";
import { triangle } from "./triangle.js";
import { h3 } from "./h3.js";

/**
 * @function grid/make
 * @description The `grid.make` function allows to create a regular grid geoJSON. For all types, For all grid types (except "h3"), the function returns a geojson with svg coordinates in the layout of the page. For type "h3", the function returns geographic coordinates in latitude and longitude.
 * @see {@link https://observablehq.com/@neocartocnrs/regular-grids}
 *
 * @property {string} [type = "square"] - Type of grid ("square", "dot", "diamond", "hexbin" (or "hex"), "trangle", "arbitrary" (or "randmon"), "h3" (or "h3geo", "hexgeo", "hexbingeo"))
 * @property {number} [step = 50] - step of grids (except for "h3" type)
 * @property {number} [level = 0] - level oh geographical hexbin grids ("h3" type only). Form 0 (large hexagons) to 4 (small hexagons). See:  https://h3geo.org
 * @property {object} [domain] - a geoJSON to define an extent (h3 only)
 * @property {boolen} [rewind] - to rewind the output (h3 only)
 * @example
 * // There are several ways to use this function
 * geoviz.grid.make(svg, { type:"diamond", step:100 })  // where svg is the container
 * svg.grid.make({ type:"diamond", step:100 })  // where svg is the container
 */

export function make(
  svg,
  {
    step = 50,
    type = "square",
    level = 0,
    domain = undefined,
    rewind = undefined,
  } = {}
) {
  switch (type) {
    case "square":
      return square({ step, width: svg.width, height: svg.height });
      break;
    case "arbitrary":
    case "random":
      return arbitrary({ step, width: svg.width, height: svg.height });
      break;
    case "dot":
      return dot({ step, width: svg.width, height: svg.height });
      break;
    case "diamond":
      return diamond({ step, width: svg.width, height: svg.height });
      break;
    case "hexbin":
    case "hex":
      return hexbin({ step, width: svg.width, height: svg.height });
      break;
    case "triangle":
      return triangle({ step, width: svg.width, height: svg.height });
      break;
    case "h3":
    case "h3geo":
    case "hexgeo":
    case "hexbingeo":
      return h3({ level, domain, rewind });
      break;
  }
}
