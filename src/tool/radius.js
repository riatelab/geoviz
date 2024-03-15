import { isNumber } from "../helpers/utils";
import { max, extent } from "d3-array";
import { scaleSqrt } from "d3-scale";
const d3 = Object.assign({}, { scaleSqrt, max, extent });

/**
 * @function tool/radius
 * @description The `tool.radius` function return a function to calculate radius of circles from data
 * @property {number[]} data - an array of numerical values.
 * @property {string[]} [options.fixmax] - to fix the value corresponding to the circle with radius = k
 * @property {string[]} [option.k = 50] - radius if the greater circle
 */

export function radius(data, { fixmax = undefined, k = 50 } = {}) {
  const valmax =
    fixmax != undefined ? fixmax : d3.max(data.map((d) => Math.abs(+d)));

  return {
    data: d3.extent(
      data.filter((d) => isNumber(d)).map((d) => Math.abs(Number(d)))
    ),
    k,
    fixmax,
    r: d3.scaleSqrt([0, valmax], [0, k]),
  };
}
