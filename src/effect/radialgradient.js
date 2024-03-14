import { unique } from "../helpers/utils";

/**
 * @function radialGradient (effect)
 * @description The `radialGradient` function allows to create a radialGradient
 * @see {@link https://observablehq.com/@neocartocnrs/effect}
 *
 * @property {string} id - id
 * @property {Number} color1 - color 1
 * @property {Number} color2 - color 2
 * @property {Number} offset1 - offset 1
 * @property {Number} offset2 - offset 2
 * @property {Number} fx - fx
 * @property {Number} fy - fy
 * @example
 * geoviz.effect.radialGradient(svg, { id: "radial", color1: "red", color2: "blue" }) // where svg is the container
 * svg.effect.radialGradient({ id: "radial", color1: "red", color2: "blue" }) // where svg is the container
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
