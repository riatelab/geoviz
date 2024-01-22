import { isNumber } from "../helpers/utils";
import { max, extent } from "d3-array";
import { scaleLinear } from "d3-scale";
const d3 = Object.assign({}, { scaleLinear, max, extent });

/**
 * @description This function return a function to calculate radius of circles from data
 *
 * @param {number[]} data - an array of numerical values.
 * @param {object} arg - options and parameters
 * @param {string[]} arg.fixmax - to fix the value corresponding to the circle with radius = k
 * @param {string[]} arg.k - radius if the greater circle
 * @return {string} an object containing a radius function.
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
