import { scaleLinear } from "d3-scale";
import { min, max, ascending } from "d3-array";
const d3 = Object.assign({}, { min, max, ascending, scaleLinear });
import { isNumber } from "./isnuber";
import { roundarray } from "./rounding";

export function datatoheight(
  data,
  { nb = 4, k = 50, round = 2, fixmax = null, factor = 1 } = {}
) {
  let arr = data
    .filter((d) => isNumber(d))
    .map((d) => Math.abs(d))
    .sort(d3.ascending);
  const valmax = fixmax != undefined ? fixmax : d3.max(arr);

  let yScale = d3.scaleLinear().domain([0, valmax]).range([0, k]);

  let rad = [];
  if (arr.length != nb && nb != null) {
    let rmin = yScale(d3.min(arr));
    let rmax = yScale(d3.max(arr));
    let rextent = rmax - rmin;
    if (nb > 2) {
      for (let i = 1; i <= nb - 2; i++) {
        rad.push(rmin + (i * rextent) / (nb - 1));
      }
    }
    rad = [rmin, rad, rmax].flat();
  } else {
    rad = arr.map((d) => yScale(d));
  }

  let values = rad.map((d) => yScale.invert(d));
  values[0] = d3.min(arr);
  values[values.length - 1] = d3.max(arr);
  values = roundarray(
    values.map((d) => d * factor),
    round
  );
  return values.map((d, i) => [d, rad[i]]);
}
