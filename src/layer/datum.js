import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

/**
 * The `datum` function generates an SVG path (in which you can't iterate) from a geoJSON
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - Options
 * @param {object} options.data - GeoJSON FeatureCollection (points)
 * @param {boolean} options.geocoords - Use `true` if input coordinates are in latitude ans longitude. Use `false` if the coordinates are already defined in the page plan
 * @param {string} options.id - id of the layer
 * @param {*} options.foo - *Other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let basemap = layer.datum(main, { data: world, fill: "#CCC" })
 * @returns {SVGSVGElement|string} - The function adds a layer with circles to the SVG container and returns the layer identifier.
 */

export function datum(svg, { id = unique(), data, geocoords = true } = {}) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: [],
  });

  // draw
  const projection = geocoords ? svg.projection : null;
  layer.append("path").datum(data).attr("d", d3.geoPath(projection));

  return `#${id}`;
}
