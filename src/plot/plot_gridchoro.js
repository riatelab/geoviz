import { create } from "../container/create";
import { render } from "../container/render";
import { unique } from "../helpers/utils";

/**
 * @function plot/gridchoro
 * @description Draw a choropleth map based on a grid aggregation.<br/><br/>
 * The function first generates a grid from the input data (see {@link tool/grid} for detailed grid options),
 * then aggregates values within each cell and displays them as a choropleth layer.
 *
 * @property {object} data - GeoJSON FeatureCollection (polygons or points) to aggregate.
 * @property {string|Array.<string>} var - Variable(s) in the GeoJSON containing numeric values. If an array of two variables is provided, a ratio is computed.
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
 * @property {number} [ratio_factor = 1] - Multiplication factor applied to ratio values (if `var` is an array of two variables).
 * @property {string} [coords = "geo"] - Coordinate system used internally ("geo" for geographic grids, "svg" for planar grids).
 * @property {string} [missing = "white"] - Fill color for missing values.
 * @property {number|null} [fixmax = null] - Maximum value for color scaling. Useful for comparing multiple maps.
 * @property {boolean} [legend = true] - Whether to display the legend.
 * @property {string} [leg_type = "vertical"] - Type of legend.
 * @property {Array.<number>} [leg_pos = [10, 10]] - Position of the legend.
 * @property {*} [svg_*] - Parameters for the SVG container (e.g., `svg_width`, `svg_height`).
 * @property {*} [*] - You can also use all parameters available in the {@link choro} function to customize the rendering. See also the {@link tool/grid}.
 *
 * @example // Basic usage
 * geoviz.plot({
 *   type: "gridchoro",
 *   data: world,
 *   grid: "square",
 *   var: "pop"
 * });
 *
 * @example // Ratio example
 * geoviz.plot({
 *   type: "gridchoro",
 *   data: world,
 *   grid: "hex",
 *   var: ["pop", "gdp"],
 *   ratio_factor: 100
 * });
 */
export function plot_gridchoro(arg1, arg2) {
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;

  // New container
  let options = newcontainer ? arg1 : arg2;

  // Default values
  let opts = {
    id: unique(),
    grid: "square",
    step: 15,
    level: 1,
    coords: "geo",
    legend: true,
    ratio_factor: 1,
    missing: "white",
    fixmax: null,
    leg_type: "vertical",
    leg_pos: [10, 10],
  };

  opts.k = opts.symbol == "square" ? 20 : 10;

  opts = { ...opts, ...options };
  let ids = `#${opts.id}`;

  // Ratio?
  const ratio = Array.isArray(opts.var) && opts.var.length === 2;

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
    ratio: ratio,
    ratio_factor: opts.ratio_factor,
    level: opts.level,
  });

  svg.plot({
    ...opts,
    type: "choro",
    data: grid,
    var: ratio ? "ratio" : (opts.var ?? "count"),
    coords: ["h3", "square_sph"].includes(opts.grid) ? "geo" : "svg",
  });

  if (newcontainer) {
    return render(svg);
  } else {
    return ids;
  }
}
