import { geoPath } from "d3-geo";
import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
const d3 = Object.assign({}, { geoPath });

/**
 * The `outline` function allows to create a layer with the limits of the earth area in the given projection
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} param1 - Options
 * @param {string} param1.id - id of the layer
 * @param {number|number[]} param1.step - Gap between graticules. The value can be a number or an array of two values
 * @param {string} param1.stroke - Stroke color
 * @param {string} param1.fill - Fill color
 * @param {string} param1.strokeWidth - Stroke width
 * @param {*} param1.foo - *Other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let outline = layer.outline(main, { fillOpacity: 0.5 })
 * @returns {SVGSVGElement|string} - The function adds a layer with the outline to the SVG container and returns the layer identifier.
 */
export function outline(
  svg,
  { id = unique(), fill = "#B5DFFD", stroke = 0, strokeWidth = 0 } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Attr with specific default values
  layer
    .attr("fill", fill)
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth);

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fill", "stroke", "strokeWidth"],
  });

  layer
    .append("path")
    .attr("d", d3.geoPath(svg.projection)({ type: "Sphere" }));

  return `#${id}`;
}
