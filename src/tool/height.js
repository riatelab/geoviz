import { isNumber } from "../helpers/utils";
import { max, extent } from "d3-array";
import { scaleLinear } from "d3-scale";
const d3 = Object.assign({}, { scaleLinear, max, extent });

/**
 * @function tool/height
 * @description This function return a function to calculate radius of circles from data. It returns an object containing a radius function.
 * @property {number[]} data - an array of numerical values.
 * @property {string[]} [options.fixmax = undefined] - to fix the value corresponding to the circle with radius = k
 * @property {string[]} [options.k = 50] - radius if the greater circle
 */

export function height(data, { fixmax = undefined, k = 50 } = {}) {
  const valmax =
    fixmax != undefined ? fixmax : d3.max(data.map((d) => Math.abs(+d)));

  return {
    data: d3.extent(
      data.filter((d) => isNumber(d)).map((d) => Math.abs(Number(d)))
    ),
    k,
    fixmax,
    h: d3.scaleLinear().domain([0, valmax]).range([0, k]).unknown(0),
  };
}
