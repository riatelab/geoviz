import { isNumber } from "../helpers/isnuber";
import * as discr from "statsbreaks";
import { getColors, getPalettes } from "dicopal";
// import { getColors } from "dicopal";
import { scaleThreshold } from "d3-scale";
import { interpolateRgbBasis } from "d3-interpolate";
import { min, range } from "d3-array";
const d3 = Object.assign(
  {},
  { scaleThreshold, min, interpolateRgbBasis, range }
);

range;
interpolateRgbBasis;

/**
 * @description This function discretizes an array of numbers
 *
 * @property {number[]} data - an array of numerical values.
 * @property {object} arg - options and parameters
 * @property {number[]} arg.breaks - class breaks including min and max
 * @property {string|string[]} arg.colors - an array of colors or name of a color palette available in [dicopal](https://observablehq.com/@neocartocnrs/dicopal-library)
 * @property {boolean} arg.reverse  reverse colors
 * @property {string} arg.missing - a color for missings values
 * @property {string} arg.method - classification method ('quantile', 'q6', 'equal', 'jenks', 'msd', 'geometric', 'headtail', 'pretty', 'arithmetic' or 'nestedmeans')
 * @property {number} arg.nb - number of classes desired
 * @property {number} arg.precision - number of digits
 * @property {boolean} arg.minmax - to keep or delete min and max
 * @property {number} arg.k - number of standard deviations taken into account (msd method only)
 * @property {boolean} arg.middle - to have the average as a class center (msd method only)
 * @example
 * geoviz.tool.choro(world.features.map((d) => d.properties.gdppc))
 * @return {object} an object containing breaks, colors, the color of the missing value and a function.
 */

export function choro(
  data,
  {
    method = "quantile",
    breaks = null,
    colors = "Algae",
    reverse = false,
    nb = 6,
    k = 1,
    middle,
    precision = 2,
    missing_fill = "white",
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

  let cols = palette(colors, bks.length - 1);

  if (reverse) {
    cols = [...cols].reverse();
  }

  const colorize = function (d) {
    return d3.scaleThreshold(bks.slice(1, -1), cols).unknown(missing_fill)(
      parseFloat(d)
    );
  };

  const missingvalues = data.length - data2.length;
  return {
    breaks: bks,
    colors: cols,
    missing: missingvalues == 0 ? false : true,
    missing_fill,
    nodata: missingvalues,
    colorize,
  };
}

function palette(colors, nb) {
  let cols;

  if (typeof colors == "string") {
    cols = getColors(colors, nb);

    // ramp color
    if (cols == undefined) {
      const arr = getPalettes({ name: colors }).map((d) => d.number);
      const min = d3.min(arr.map((d) => Math.abs(d - nb)));
      const indexpal = arr.findIndex((d) => Math.abs(d - nb) == min);
      const proxy = getColors(colors, arr[indexpal]);
      return d3.range(nb).map((d) => d3.interpolateRgbBasis(proxy)(d / nb));
    }
  }
  if (typeof colors == "object") {
    if (colors.length != nb) {
      cols = d3.range(nb).map((d) => d3.interpolateRgbBasis(colors)(d / nb));
    } else {
      cols = colors;
    }
  }

  return cols;
}
