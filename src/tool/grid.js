import { diamond, dot, hexbin, random, square, triangle, h3 } from "geogrid";

/**
 * @function tool/grid
 * @description The `tool.grid` function allows to create a regular grid geoJSON. For all types, For all grid types (except "h3"), the function returns a geojson with svg coordinates in the layout of the page. For type "h3", the function returns geographic coordinates in latitude and longitude.
 * @see {@link https://observablehq.com/@neocartocnrs/regular-grids}
 * @property {string} [type = "square"] - Type of grid ("square", "dot", "diamond", "hexbin" (or "hex"), "trangle", "arbitrary" (or "randmon"), "h3" (or "h3geo", "hexgeo", "hexbingeo"))
 * @property {number} [step = 50] - step of grids (except for "h3" type)
 * @property {boolean} [overflow = true] - dpending on the step you choose, the grid may be smaller than the bounding box defined by with and height. With overflow = true, the grid is allowed to exceed the bounding box.
 * @property {number} [level = 0] - level oh geographical hexbin grids ("h3" type only). Form 0 (large hexagons) to 4 (small hexagons). See:  https://h3geo.org
 * @property {object} [domain] - a geoJSON to define an extent (h3 only)
 * @property {boolen} [rewind] - to rewind the output (h3 only)
 * @example
 * // There are several ways to use this function
 * geoviz.tool.grid(svg, { type:"diamond", step:100 })  // where svg is the container
 * svg.grid({ type:"diamond", step:100 })  // where svg is the container
 */

export function grid(...args) {
  // Detect call signature
  let svg, opts;
  if (args.length === 1) {
    svg = undefined;
    opts = args[0];
  } else {
    [svg, opts] = args;
  }

  // Default options
  const {
    step = 50,
    type = "square",
    level = 0,
    overflow = true,
    domain = undefined,
    rewind = undefined,
    width = svg?.width ?? 1000,
    height = svg?.height ?? 1000,
  } = opts || {};

  switch (type) {
    case "square":
      return square({ step, width, height, overflow });
    case "arbitrary":
    case "random":
      return random({ step, width, height });
    case "dot":
      return dot({ step, width, height, overflow });
    case "diamond":
      return diamond({ step, width, height, overflow });
    case "hexbin":
    case "hex":
      return hexbin({ step, width, height, overflow });
    case "triangle":
      return triangle({ step, width, height, overflow });
    case "h3":
    case "h3geo":
    case "hexgeo":
    case "hexbingeo":
      return h3({ level, domain, rewind });
    default:
      throw new Error(`Unknown grid type: ${type}`);
  }
}
