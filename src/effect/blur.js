import { unique } from "../helpers/utils";

/**
 * @function effect/blur
 * @description The `blur` function allows to create a svg blur filter. It adds a filter to the defs and returns the id like `"url(#id)"`.
 * @see {@link https://observablehq.com/@neocartocnrs/effect}
 *
 * @property {string} [id] - id
 * @property {number} [stdDeviation = 1.5] - standard deviation
 * @example
 * // There are several ways to use this function
 * geoviz.effect.blur(svg, { stdDeviation: 0, id: "blur" }) // where svg is the container
 * svg.effect.blur({ stdDeviation: 0, id: "blur" }) // where svg is the container
 * svg.plot({ type: "blur", stdDeviation: 0, id: "blur" }) // where svg is the container
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
