import { unique } from "../helpers/unique";

/**
 * The `blur` function allows to create a svg filte
 * It can be use ta add a shadow effect
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id
 * @param {number} options.stdDeviation - standard deviation
 * @example
 * let filter = viz.style.blur(svg, { stdDeviation: 0, id: "blur" })
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
