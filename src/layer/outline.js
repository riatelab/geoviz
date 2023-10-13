import { geoPath } from "d3-geo";
import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
import { zoomclass } from "../helpers/zoomclass";
const d3 = Object.assign({}, { geoPath });

/**
 * The `outline` function allows to create a layer with the limits of the earth area in the given projection
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id of the layer
 * @param {string} options.stroke - stroke color
 * @param {string} options.fill - fill color
 * @param {string} options.strokeWidth - stroke width
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let outline = geoviz.layer.outline(main, { fillOpacity: 0.5 })
 * @returns {SVGSVGElement|string} - the function adds a layer with the outline to the SVG container and returns the layer identifier.
 */
export function outline(
  svg,
  { id = unique(), fill = "#B5DFFD", stroke = 0, strokeWidth = 0 } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg
        .append("g")
        .attr("id", id)
        .attr("class", svg.inset ? "nozoom" : "zoomableoutline")
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
