import { unique } from "../helpers/utils";

/**
 * @function shadow (effect)
 * @description The `shadow` function allows to create a svg filter. It can be use ta add a shadow effect
 * @see {@link https://observablehq.com/@neocartocnrs/effect}
 *
 * @property {string} id - id
 * @property {string} dx - shift in x
 * @property {string} dy - shift in y
 * @property {string} fill - fill color
 * @property {number} fillOpacity - fill-opacity (you can use also opacity)
 * @property {number} stdDeviation - standard deviation
 * @example
 * geoviz.effect.shadow(svg, { stdDeviation: 0, id: "blur" }) // where svg is the container
 * svg.effect.shadow({ stdDeviation: 2, id: "shadow" }) // where svg is the container
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
