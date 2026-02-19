import { contour } from "../mark/contour";

/**
 * @function plot/smooth
 * @description
 * `plot({type = "smooth"})` is a convenient wrapper around `contour` to generate and display **smoothed density contours** (isobands) from a set of points.
 *
 * It applies default styling optimized for smooth visualizations, including stroke, fill opacity, shadow, and legend.
 * Colors can be defined either as a single fill (`fill`) or using a sequential palette (`colors`) from Dicopal.
 * Tooltips can be enabled via `tip` or `tipstyle`.
 *
 * `plot_smooth` automatically detects whether a **new SVG container** should be created or an existing one is provided.
 * @see {@link https://observablehq.com/@neocartocnrs/contour}
 *
 * @property {object|GeoJSON[]} [data] - a GeoJSON FeatureCollection (points)
 * @property {string} [id] - ID of the layer
 * @property {string|number} [var] - name of the variable used to weight points
 * @property {number} [nb=100000] - number of sampled points for density calculation
 * @property {number} [bandwidth] - bandwidth used for density computation
 * @property {boolean} [fixbandwidth=false] - if true, scales bandwidth by zoom factor
 * @property {number} [thresholds] - number of contour levels
 * @property {number} [cellSize] - size of the grid cell for density computation
 * @property {string} [stroke="white"] - stroke color of polygons
 * @property {number} [strokeOpacity=0.8] - stroke opacity
 * @property {number} [strokeWidth=0.3] - stroke width
 * @property {boolean} [shadow=true] - add a shadow filter on polygons
 * @property {string|function} [fill] - single fill color (used if `colors` is not defined)
 * @property {string} [colors="RdPu"] - name of a dicopal sequential palette for coloring polygons (see https://observablehq.com/@neocartocnrs/dicopal-library)
 * @property {number} [opacity] - global opacity
 * @property {number} [fillOpacity=0.6] - fill opacity for polygons
 * @property {boolean|function} [tip] - function to display tooltips; true displays all properties
 * @property {object} [tipstyle] - custom tooltip styles
 * @property {string} [coords="geo"] - use "svg" if the coordinates are already in the SVG plane
 * @property {boolean} [legend=true] - display a legend for colored bands
 * @property {array} [leg_pos=[10,10]] - position of the legend [x, y]
 * @property {*} [*] - other SVG attributes that can be applied (strokeDasharray, strokeWidth, opacity, strokeLinecap, etc.)
 * @property {*} [svg_*] - parameters of the SVG container if the layer is created without an existing container (e.g., svg_width)
 *
 * @example
 * geoviz.plot({type:"smooth", data: cities, var: "pop"})
 */
export function plot_smooth(arg1, arg2) {
  const newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups;

  const defaults = {
    stroke: "white",
    strokeOpacity: 0.8,
    strokeWidth: 0.3,
    tip: undefined,
    tipstyle: undefined,
    fill: undefined,
    colors: "RdPu",
    opacity: undefined,
    fillOpacity: 0.6,
    shadow: true,
    legend: true,
    leg_missing: false,
    leg_pos: [10, 10],
  };

  const options = {
    ...defaults,
    ...(newcontainer ? arg1 : arg2),
  };

  return newcontainer ? contour(options) : contour(arg1, options);
}
