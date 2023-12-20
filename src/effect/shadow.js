import { unique } from "../helpers/utils";

/**
 * @description The `blur` function allows to create a svg filte. It can be use ta add a shadow effect
 * @see {@link https://observablehq.com/@neocartocnrs/effect}
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} arg - options and parameters
 * @param {string} arg.id - id
 * @param {string} arg.dx - shift in x
 * @param {string} arg.dy - shift in y
 * @param {string} arg.fill - fill color
 * @param {number} arg.fillOpacity - fill-opacity (you can use also opacity)
 * @param {number} arg.stdDeviation - standard deviation
 * @example
 * geoviz.effect.blur(svg, { stdDeviation: 0, id: "blur" }) // where svg is the container
 * svg.effect.blur({ stdDeviation: 0, id: "blur" }) // where svg is the container
 * @returns {SVGSVGElement|string} - the function adds a filter to the defs and returns the id like "url(#id)".
 */
export function shadow(
  svg,
  {
    id = unique(),
    stdDeviation = 1.5,
    dx = 4,
    dy = 4,
    fill = "black",
    fillOpacity = 0.5,
    opacity = undefined,
  } = {}
) {
  let defs = svg.select("#defs");

  defs.select(`#${id}`).remove();

  defs
    .append("defs")
    .append("filter")
    .attr("id", id)
    .append("feDropShadow")
    .attr("dx", dx)
    .attr("dy", dy)
    .attr("stdDeviation", stdDeviation)
    .attr("flood-color", fill)
    .attr("flood-opacity", opacity || fillOpacity)
    .append("feGaussianBlur");

  return `url(#${id})`;
}
