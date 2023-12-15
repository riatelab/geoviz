import { getColors } from "dicopal";
import { scaleOrdinal } from "d3-scale";
const d3 = Object.assign({}, { scaleOrdinal });

/**
 * @description This function allows you to assign colors to qualitative data. It can be used to create typology maps.
 *
 * @param {number[]} data - an array of numerical values.
 * @param {object} arg - options and parameters
 * @param {string[]} arg.colors - an array of ordored colors
 * @param {string[]} arg.palette - name of a color palette available in [dicopal](https://observablehq.com/@neocartocnrs/dicopal-library)
 * @param {string} arg.missing - a color for missings values
 * @example
 * .geoviz.tool.typo(world.features.map((d) => d.properties.region), {palette: "Pastel"})
 * @return {object} an object containing types, colors, the color of the missing value and a function.
 */

export function typo(
  data,
  { colors = null, palette = "Set3", missing_fill = "white" } = {}
) {
  let types = Array.from(new Set(data)).filter(
    (d) => d !== "" && d != null && d != undefined
  );

  let nodata =
    data.length -
    data.filter((d) => d !== "" && d != null && d != undefined).length;
  let cols = colors || getColors(palette, types.length);
  let colorize = d3
    .scaleOrdinal()
    .domain(types)
    .range(cols)
    .unknown(missing_fill);

  return {
    types,
    colors: cols,
    missing: nodata == 0 ? false : true,
    missing_fill,
    nodata,
    colorize,
  };
}
