import { getColors } from "dicopal";
import { scaleOrdinal } from "d3-scale";
const d3 = Object.assign({}, { scaleOrdinal });
export function typo(
  arr,
  { colors = null, palette = "Set3", missing = "white" } = {}
) {
  let types = Array.from(new Set(arr)).filter(
    (d) => d !== "" && d != null && d != undefined
  );
  let cols = colors || getColors(palette, types.length);
  let colorize = d3.scaleOrdinal().domain(types).range(cols).unknown(missing);

  return { types, colors: cols, missing, colorize };
}
