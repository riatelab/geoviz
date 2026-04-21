import { create } from "../container/create";
import { render } from "../container/render";
import { unique } from "../helpers/utils";

/**
 * @function gridprop
 * @description Draw a proportional symbol map based on a grid aggregation.<br/><br/>
 * The function first generates a grid from the input data (see {@link tool/grid} for detailed grid options),
 * then displays values within each cell as proportional symbols.
 *
 * @property {object} data - GeoJSON FeatureCollection (polygons or points) to aggregate.
 * @property {string} var - Variable in the GeoJSON containing numeric values.
 * @property {string} [grid = "square"] - Type of grid used for aggregation. Available types:
 *   - "square"
 *   - "dot"
 *   - "diamond"
 *   - "hexbin" / "hex"
 *   - "triangle"
 *   - "arbitrary" / "random"
 *   - "h3" / "h3geo" / "hexgeo" / "hexbingeo"
 *   - "square_sph" (spherical squares for global maps)
 * @property {number} [step = 15] - Resolution of the grid (in SVG coordinates for planar grids).
 * @property {number} [level = 1] - Level of subdivision for hierarchical grids (e.g., H3).
 * @property {string} [coords = "geo"] - Coordinate system used internally ("geo" for geographic grids, "svg" for planar grids).
 * @property {string} [missing = "white"] - Fill color for missing values.
 * @property {string} [symbol = "circle"] - Choice of symbol to represent the value ("circle", "square", "spike", "halfcircle").
 * @property {number} [k = 10] - Size of the largest symbol (20 if symbol = "square").
 * @property {number} [width = 30] - Width of spikes (if symbol = "spike").
 * @property {number} [straight = 0] - Curvature of spikes (0 = curved, 1 = straight).
 * @property {number|null} [fixmax = null] - Maximum value for symbol scaling. Useful for comparing multiple maps.
 * @property {boolean} [legend = true] - Whether to display the legend.
 * @property {string} [leg_type = "separate"] - Type of legend ("nested" or "separate").
 * @property {Array.<number>} [leg_pos = [10, 10]] - Position of the legend.
 * @property {string} [leg_title] - Title of the legend (defaults to `var`).
 * @property {*} [svg_*] - Parameters for the SVG container (e.g., `svg_width`, `svg_height`).
 * @property {*} [*] - You can also use all parameters available in the {@link prop} function to customize the rendering. See also {@link tool/grid}.
 *
 * @example // Basic usage
 * geoviz.plot({
 *   type: "gridprop",
 *   data: world,
 *   grid: "square",
 *   var: "pop"
 * });
 *
 * @example // Hexagonal grid
 * geoviz.plot({
 *   type: "gridprop",
 *   data: world,
 *   grid: "hex",
 *   var: "gdp",
 *   symbol: "square",
 *   k: 20
 * });
 */
export function gridprop(arg1, arg2) {
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;

  // New container
  let options = newcontainer ? arg1 : arg2;

  // Default values
  let opts = {
    grid: "square",
    step: 15,
    level: 1,
    coords: "geo",
    legend: true,
    symbol: "circle",
    straight: 0,
    width: 30,
    id: unique(),
    missing: "white",
    k: 10,
    fixmax: null,
    leg_type: "separate",
    leg_pos: [10, 10],
  };

  opts.k = opts.symbol == "square" ? 20 : 10;

  opts = { ...opts, ...options };
  let ids = `#${opts.id}`;

  // leg title
  opts.leg_title = opts.leg_title ? opts.leg_title : opts.var;

  // New container
  let svgopts = { domain: opts.data || opts.datum };
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(0, 4) == "svg_" ? d.slice(4) : d]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

  // GRID
  let grid = svg.grid({
    type: opts.grid,
    step: opts.step,
    data: opts.data,
    var: opts.var,
    level: opts.level,
  });

  svg.plot({
    ...opts,
    type: "prop",
    data: grid,
    var: opts.var || "count",
    coords: ["h3", "square_sph"].includes(opts.grid) ? "geo" : "svg",
  });

  if (newcontainer) {
    return render(svg);
  } else {
    return ids;
  }
}
