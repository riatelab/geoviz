import {
  diamond,
  dot,
  hexbin,
  random,
  square,
  triangle,
  h3,
  pointstogrid,
  linestogrid,
  polygonstogrid,
  project,
} from "geogrid";

import { implantation } from "../helpers/utils";

/**
 * @function tool/grid
 * @description The `tool.grid` function creates a regular grid as a GeoJSON object.
 * For all grid types (except "h3"), the function returns a GeoJSON with SVG coordinates in page layout.
 * For type "h3", it returns geographic coordinates (latitude and longitude).
 * @see {@link https://observablehq.com/@neocartocnrs/regular-grids}
 * @param {object} svg - The SVG container or map object
 * @param {object} opts - Options
 * @property {string} [type="square"] - Grid type ("square", "dot", "diamond", "hexbin"/"hex", "triangle", "arbitrary"/"random", "h3"/"h3geo"/"hexgeo"/"hexbingeo").
 * @property {number} [step=50] - Grid step (except for "h3" type).
 * @property {boolean} [overflow=true] - If true, the grid may exceed the bounding box.
 * @property {number} [level=0] - Geographical hexbin level ("h3" type only). From 0 (large hexagons) to 4 (small hexagons).
 * @property {object} [domain] - GeoJSON defining the extent (h3 only).
 * @property {boolean} [rewind] - Rewind polygons (h3 only).
 * @property {object} [data] - GeoJSON input for statistical computation.
 * @example
 * geoviz.tool.grid(svg, { type: "diamond", step: 100 });
 */
export function grid(svg, opts = {}) {
  const {
    coords = "geo",
    data = undefined,
    var: variable = undefined, // <-- alias pour var
    values = false,
    step = 50,
    type = "square",
    level = 0,
    overflow = true,
    domain = undefined,
    rewind = undefined,
    ratio = false,
    ratio_factor = 1,
  } = opts;

  // --- Create grid ---
  let grid;
  switch (type) {
    case "square":
      grid = square({ step, width: svg.width, height: svg.height, overflow });
      break;
    case "arbitrary":
    case "random":
      grid = random({ step, width: svg.width, height: svg.height, overflow });
      break;
    case "dot":
      grid = dot({ step, width: svg.width, height: svg.height, overflow });
      break;
    case "diamond":
      grid = diamond({ step, width: svg.width, height: svg.height, overflow });
      break;
    case "hexbin":
    case "hex":
      grid = hexbin({ step, width: svg.width, height: svg.height, overflow });
      break;
    case "triangle":
      grid = triangle({ step, width: svg.width, height: svg.height, overflow });
      break;
    case "h3":
    case "h3geo":
    case "hexgeo":
    case "hexbingeo":
      grid = h3({ level, domain, rewind });
      break;
    default:
      throw new Error(`Unknown grid type: ${type}`);
  }

  // --- If data is provided, compute stats ---
  let output = grid; // valeur par défaut = la grille seule

  if (data) {
    console.log("data exists");

    let geom = data;
    if (coords !== "svg" && grid.geo === false) {
      geom = project(JSON.parse(JSON.stringify(data)), {
        projection: svg.projection,
      });
    }

    const typeData = implantation(data);

    switch (typeData) {
      case 1:
        output = pointstogrid({
          grid,
          points: geom,
          var: variable,
          values,
          spherical: grid.geo ? true : false,
        });
        break;
      case 2:
        output = linestogrid({
          grid,
          lines: geom,
          var: variable,
          values,
          spherical: grid.geo ? true : false,
        });
        break;
      case 3:
        output = polygonstogrid({
          grid,
          polygons: geom,
          var: variable,
          values,
          spherical: grid.geo ? true : false,
        });
        break;
      default:
        console.warn("Unknown data geometry type:", typeData);
        output = grid;
    }
  }

  // Compute ratio ?

  if (ratio === true && Array.isArray(variable) && variable.length === 2) {
    output.features.forEach((feature) => {
      const val1 = feature.properties[variable[0]];
      const val2 = feature.properties[variable[1]];
      feature.properties.ratio = (val1 / val2) * ratio_factor;
    });
  }

  // Unproject ?

  return output;
}
