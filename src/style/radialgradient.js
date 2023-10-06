import { unique } from "../helpers/unique";

/**
 * The `radialGradient` function allows to create a radialGradient
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
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
    // .append("defs")
    // .append("filter")
    // .attr("id", id)
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
