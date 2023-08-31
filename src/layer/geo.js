import { tooltip } from "../helpers/tooltip";
import { addattr } from "../helpers/addattr";
import { random } from "../classify/random";
import { implantation } from "../helpers/implantation";
import { unique } from "../helpers/unique";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

/**
 * The `geo` function generates SVG paths (in which you can iterate) from a geoJSON
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} param1 - Options
 * @param {object} param1.data - GeoJSON FeatureCollection (points)
 * @param {string} param1.id - id of the layer
 * @param {boolean} param1.geocoords - Use `true` if input coordinates are in latitude ans longitude. Use `false` if the coordinates are already defined in the page plan
 * @param {string|function} param1.fill - Fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} param1.stroke - Stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} param1.tip - Tooltip content
 * @param {object} param1.tipstyle - Tooltip style
 * @param {*} param1.foo - *Other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let circles = layer.bubble(main, { data: cities, r: "population" })
 * @returns {SVGSVGElement|string} - The function adds a layer with circles to the SVG container and returns the layer identifier.
 */
export function geo(
  svg,
  {
    id = unique(),
    geocoords = true,
    data,
    tip,
    tipstyle,
    fill = implantation(data) == 2 ? "none" : random(),
    stroke = implantation(data) == 2 ? random() : "white",
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fill", "stroke"],
  });

  // draw
  const projection = geocoords ? svg.projection : null;

  layer
    .selectAll("path")
    .data(data.features.filter((d) => d.geometry !== null))
    .join("path")
    .attr("d", d3.geoPath(projection))
    .attr("fill", fill)
    .attr("stroke", stroke);

  // Tooltip
  if (tip) {
    tooltip(layer, svg, tip, tipstyle);
  }

  return `#${id}`;
}
