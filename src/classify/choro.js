import { isNumber } from "../helpers/isnuber";
import * as discr from "statsbreaks";
import { getColors } from "dicopal";
import { scaleThreshold } from "d3-scale";
const d3 = Object.assign({}, { scaleThreshold });

/**
 * This is a function.
 *
 * @param {string} n - A string param
 * @param {string} [o] - A optional string param
 * @param {string} [d=DefaultValue] - A optional string param
 * @return {string} A good string
 *
 * @example
 *
 *     foo('hello')
 */

export function choro(
  arr,
  {
    method = "quantile",
    breaks = null,
    colors = null,
    nb = 6,
    palette = "Algae",
    missing = "white",
  } = {}
) {
  const bks =
    breaks ||
    discr.breaks(
      arr.filter((d) => isNumber(d)),
      {
        method,
        nb,
      }
    );

  const cols = colors || getColors(palette, bks.length - 1);
  const colorize = d3.scaleThreshold(bks.slice(1, -1), cols).unknown(missing);
  return { breaks: bks, colors: cols, missing, colorize };
}
