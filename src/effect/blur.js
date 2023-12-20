import { unique } from "../helpers/utils";

/**
 * @description The `blur` function allows to create a svg blur filter.
 * @see {@link https://observablehq.com/@neocartocnrs/effect}
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} arg - options and parameters
 * @param {string} arg.id - id
 * @param {number} arg.stdDeviation - standard deviation
 * @example
 * geoviz.effect.blur(svg, { stdDeviation: 0, id: "blur" }) // where svg is the container
 * svg.effect.blur({ stdDeviation: 0, id: "blur" }) // where svg is the container
 * @returns {SVGSVGElement|string} - the function adds a filter to the defs and returns the id like "url(#id)".
 */
export function blur(svg, { id = unique(), stdDeviation = 1.5 } = {}) {
  let defs = svg.select("#defs");

  defs.select(`#${id}`).remove();

  defs
    .append("defs")
    .append("filter")
    .attr("id", id)
    .append("feGaussianBlur")
    .attr("stdDeviation", stdDeviation);

  return `url(#${id})`;
}
