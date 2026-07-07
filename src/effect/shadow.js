import { unique } from "../helpers/utils";

/**
 * @function effect/shadow
 * @description The `shadow` function allows to create a svg filter. It can be use ta add a shadow effect. The function adds a filter to the defs and returns the id like `"url(#id)"`.
 * @see {@link https://observablehq.com/@neocartocnrs/effect}
 *
 * @property {string} [id] - id
 * @property {string} [dx = 4] - shift in x
 * @property {string} [dy = 4] - shift in y
 * @property {string} [fill = "black"] - fill color
 * @property {number} [fillOpacity = 0.5] - fill-opacity (you can use also opacity)
 * @property {number} [stdDeviation = 1.5] - standard deviation
 * @property {number} [opacity = 1] - opacity
 * @example
 * // There are several ways to use this function
 * geoviz.effect.shadow(svg, { stdDeviation: 0, id: "blur" }) // where svg is the container
 * svg.effect.shadow({ stdDeviation: 2, id: "shadow" }) // where svg is the container
 * svg.plot({type:"shadow", stdDeviation: 2, id: "shadow" }) // where svg is the container
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
  } = {}
) {
  let defs = svg.select("#defs");

  defs.select(`#${id}`).remove();

  const filter = defs
    .append("filter")
    .attr("id", id)
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  filter
    .append("feGaussianBlur")
    .attr("in", "SourceAlpha")
    .attr("stdDeviation", stdDeviation)
    .attr("result", "blur");

  filter
    .append("feOffset")
    .attr("in", "blur")
    .attr("dx", dx)
    .attr("dy", dy)
    .attr("result", "offsetBlur");

  filter
    .append("feFlood")
    .attr("flood-color", fill)
    .attr("flood-opacity", fillOpacity)
    .attr("result", "color");

  filter
    .append("feComposite")
    .attr("in", "color")
    .attr("in2", "offsetBlur")
    .attr("operator", "in")
    .attr("result", "shadow");

  const merge = filter.append("feMerge");

  merge.append("feMergeNode").attr("in", "shadow");
  merge.append("feMergeNode").attr("in", "SourceGraphic");

  return `url(#${id})`;
}