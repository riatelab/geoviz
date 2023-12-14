import { unique } from "../helpers/utils";

/**
 * The `radialGradient` function allows to create a radialGradient
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id
 * @param {Number} options.color1 - color 1
 * @param {Number} options.color2 - color 2
 * @param {Number} options.offset1 - offset 1
 * @param {Number} options.offset2 - offset 2
 * @param {Number} options.fx - fx
 * @param {Number} options.fy - fy
 * @example
 * let filter = viz.defs.radialGradient(svg, { id: "radial", color1: "red", color2: "blue" })
 * @returns {SVGSVGElement|string} - the function adds a filter to the defs and returns the id like "url(#id)".
 */
export function radialGradient(
  svg,
  {
    id = unique(),
    color1 = "#63b0af",
    color2 = "#428c8b",
    offset1 = 50,
    offset2 = 100,
    fx = 50,
    fy = 50,
  } = {}
) {
  let defs = svg.select("#defs");

  defs.select(`#${id}`).remove();

  let effect = defs
    .append("radialGradient")
    .attr("id", id)
    .attr("fx", `${fx}%`)
    .attr("fy", `${fy}%`);
  effect
    .append("stop")
    .attr("offset", `${offset1}%`)
    .attr("stop-color", color1);
  effect
    .append("stop")
    .attr("offset", `${offset2}%`)
    .attr("stop-color", color2);

  return `url(#${id})`;
}
