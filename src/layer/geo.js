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
 * @param {object} options - options and parameters
 * @param {object} options.data - GeoJSON FeatureCollection (points)
 * @param {string} options.id - id of the layer
 * @param {boolean} options.geocoords - use `true` if input coordinates are in latitude ans longitude. Use `false` if the coordinates are already defined in the page plan
 * @param {string|function} options.fill - fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} options.stroke - stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} options.tip - tooltip content
 * @param {object} options.tipstyle - tooltip style
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let circles = geoviz.layer.bubble(main, { data: cities, r: "population" })
 * @returns {SVGSVGElement|string} - the function adds a layer with circles to the SVG container and returns the layer identifier.
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
    tooltip(layer, svg, tip, tipstyle, id);
  }

  return `#${id}`;
}
