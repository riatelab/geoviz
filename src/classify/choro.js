import * as discr from "statsbreaks";
import { getColors } from "dicopal";
import { scaleThreshold } from "d3-scale";
const d3 = Object.assign({}, { scaleThreshold });

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
    discr.breaks(arr, {
      method,
      nb,
    });

  const cols = colors || getColors("Algae", bks.length - 1);
  const colorize = d3.scaleThreshold(bks.slice(1, -1), cols).unknown(missing);
  return { breaks: bks, colors: cols, missing, colorize };
}
