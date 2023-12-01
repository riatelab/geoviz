/**
 * This function return a function to calculate radius of circles from data
 *
 * @param {number[]} data - an array of numerical values.
 * @param {object} options - options and parameters
 * @param {string[]} options.fixmax - to fix the value corresponding to the circle with radius = k
 * @param {string[]} options.k - radius if the greater circle
 * @return {string} a color
 */

import { max } from "d3-array";
import { scaleSqrt } from "d3-scale";
const d3 = Object.assign({}, { scaleSqrt, max });

export function radius2(data, { fixmax = undefined, k = 50 } = {}) {
  const valmax =
    fixmax != undefined ? fixmax : d3.max(data.map((d) => Math.abs(+d)));

  return {
    data,
    k,
    fixmax,
    colorize: d3.scaleSqrt([0, valmax], [0, k]),
  };
}
