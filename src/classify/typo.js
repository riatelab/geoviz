import { getColors } from "dicopal";
import { scaleOrdinal } from "d3-scale";
const d3 = Object.assign({}, { scaleOrdinal });

/**
 * This function allows you to assign colors to qualitative data. It can be used to create typology maps.
 *
 * @param {number[]} data - an array of numerical values.
 * @param {object} options - options and parameters
 * @param {string[]} options.colors - an array of ordored colors
 * @param {string[]} options.palette - name of a color palette available in [dicopal](https://observablehq.com/@neocartocnrs/dicopal-library)
 * @param {string} options.missing - a color for missings values
 * @example
 * classify.typo(world.features.map((d) => d.properties.region), {palette: "Pastel"})
 * @return {object} an object containg types, colors, the color of the missing value and a function.
 */

export function typo(
  data,
  { colors = null, palette = "Set3", missing = "white" } = {}
) {
  let types = Array.from(new Set(data)).filter(
    (d) => d !== "" && d != null && d != undefined
  );
  let cols = colors || getColors(palette, types.length);
  let colorize = d3.scaleOrdinal().domain(types).range(cols).unknown(missing);

  return { types, colors: cols, missing, colorize };
}
