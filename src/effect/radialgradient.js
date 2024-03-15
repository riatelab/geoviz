import { unique } from "../helpers/utils";

/**
 * @function effect/radialGradient
 * @description The `radialGradient` function allows to create a radialGradient. The function adds a filter to the defs and returns the id like `"url(#id)"`.
 * @see {@link https://observablehq.com/@neocartocnrs/effect}
 *
 * @property {string} [id] - id
 * @property {Number} [color1 = "#63b0af"] - color 1
 * @property {Number} [color2 = "#428c8b"] - color 2
 * @property {Number} [offset1 = 50] - offset 1
 * @property {Number} [offset2 = 100] - offset 2
 * @property {Number} [fx = 50] - fx
 * @property {Number} [fy = 50] - fy
 * @example
 * // There are several ways to use this function
 * geoviz.effect.radialGradient(svg, { id: "radial", color1: "red", color2: "blue" }) // where svg is the container
 * svg.effect.radialGradient({ id: "radial", color1: "red", color2: "blue" }) // where svg is the container
 * svg.plot({ type:"radialGradient",  id: "radial", color1: "red", color2: "blue" }) // where svg is the container
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
