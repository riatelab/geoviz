import { isNumber } from "../helpers/isnuber";
import * as discr from "statsbreaks";
import { getColors } from "dicopal";
import { scaleThreshold } from "d3-scale";
const d3 = Object.assign({}, { scaleThreshold });

/**
 * This function discretizes an array of numbers
 *
 * @param {number[]} data - an array of numerical values.
 * @param {object} options - options and parameters
 * @param {number[]} options.breaks - class breaks including min and max
 * @param {string[]} options.colors - an array of colors
 * @param {string} options.missing - a color for missings values
 * @param {string[]} options.palette - name of a color palette available in [dicopal](https://observablehq.com/@neocartocnrs/dicopal-library)
 * @param {string} options.method - classification method ('quantile', 'q6', 'equal', 'jenks', 'msd', 'geometric', 'headtail', 'pretty' or 'arithmetic')
 * @param {number} options.nb - number of classes desired
 * @param {number} options.precision - number of digits
 * @param {boolean} options.minmax - to keep or delete min and max
 * @param {number} options.k - number of standard deviations taken into account (msd method only)
 * @param {boolean} options.middle - o have the average as a class center (msd method only)
 * @example
 * classify.choro(world.features.map((d) => d.properties.gdppc))
 * @return {object} an object containg breaks, colors, the color of the missing value and a function.
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
  let data2 = data.filter((d) => isNumber(d));
  const bks =
    breaks ||
    discr.breaks(data2, {
      method,
      nb,
      k,
      middle,
      precision,
    });

  const cols = colors || getColors(palette, bks.length - 1);
  const colorize = function (d) {
    return d3.scaleThreshold(bks.slice(1, -1), cols).unknown(missing)(
      parseFloat(d)
    );
  };
  return {
    breaks: bks,
    colors: cols,
    missing,
    nodata: data.length - data2.length,
    colorize,
  };
}
