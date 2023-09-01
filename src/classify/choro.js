import { isNumber } from "../helpers/isnuber";
import * as discr from "statsbreaks";
import { getColors } from "dicopal";
import { scaleThreshold } from "d3-scale";
const d3 = Object.assign({}, { scaleThreshold });

/**
 * This function discretizes an array of numbers
 *
 * @param {number[]} data - An array of numerical values.
 * @param {object} options - Options and parameters
 * @param {number[]} options.breaks - Class breaks including min and max
 * @param {string[]} options.colors - An array of colors
 * @param {string} options.missing - a color for missings values
 * @param {string[]} options.palette - Name of a color palette available in [dicopal](https://observablehq.com/@neocartocnrs/dicopal-library)
 * @param {string} options.method - Classification method ('quantile', 'q6', 'equal', 'jenks', 'msd', 'geometric', 'headtail', 'pretty' or 'arithmetic')
 * @param {number} options.nb - Number of classes desired
 * @param {number} options.precision - Number of digits
 * @param {boolean} options.minmax - To keep or delete min and max
 * @param {number} options.k - Number of standard deviations taken into account (msd method only)
 * @param {boolean} options.middle - To have the average as a class center (msd method only)
 * @example
 * classify.choro(world.features.map((d) => d.properties.gdppc))
 * @return {object} An object containg breaks, colors, the color of the missing value and a function.
 */

export function choro(
  data,
  {
    method = "quantile",
    breaks = null,
    colors = null,
    nb = 6,
    k = 1,
    middle,
    precision = 2,
    palette = "Algae",
    missing = "white",
  } = {}
) {
  const bks =
    breaks ||
    discr.breaks(
      data.filter((d) => isNumber(d)),
      {
        method,
        nb,
        k,
        middle,
        precision,
      }
    );

  const cols = colors || getColors(palette, bks.length - 1);
  const colorize = d3.scaleThreshold(bks.slice(1, -1), cols).unknown(missing);
  return { breaks: bks, colors: cols, missing, colorize };
}
