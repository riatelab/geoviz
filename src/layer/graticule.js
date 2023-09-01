import { geoGraticule, geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoGraticule });
import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";

/**
 * The `graticule` function allows to create a layer with lat/long lines
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id of the layer
 * @param {number|number[]} options.step - gap between graticules. The value can be a number or an array of two values
 * @param {string} options.stroke - stroke color
 * @param {string} options.fill - fill color
 * @param {string} options.strokeWidth - stroke width
 * @param {string} options.strokeLinecap - stroke-inecap
 * @param {string} options.strokeLinejoin - stroke-Linejoin
 * @param {string} options.strokeDasharray - stroke-dasharray
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let graticule = layer.graticule(main, { step: 2 })
 * @returns {SVGSVGElement|string} - the function adds a layer with graticule lines to the SVG container and returns the layer identifier.
 */
export function graticule(
  svg,
  {
    id = unique(),
    step = 10,
    stroke = "red",
    strokeWidth = 0.8,
    strokeLinecap = "square",
    strokeLinejoin = "round",
    strokeDasharray = 2,
  } = {}
) {
  step = Array.isArray(step) ? step : [step, step];

  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Attr with specific default values
  layer
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-linecap", strokeLinecap)
    .attr("stroke-linejoin", strokeLinejoin)
    .attr("stroke-dasharray", strokeDasharray);

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: [],
  });

  layer
    .append("path")
    .datum(d3.geoGraticule().step(step))
    .attr("d", d3.geoPath(svg.projection));

  return `#${id}`;
}
