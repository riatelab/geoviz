import { scaleSqrt } from "d3-scale";
import { min, max, ascending } from "d3-array";
const d3 = Object.assign({}, { min, max, scaleSqrt, ascending });
import { isNumber } from "./isnuber";
import { roundarray } from "./rounding";

export function datatoradius(
  data,
  { nb = 4, k = 50, round = 2, fixmax = null } = {}
) {
  let arr = data
    .filter((d) => isNumber(d))
    .map((d) => Math.abs(d))
    .sort(d3.ascending);
  const valmax = fixmax != undefined ? fixmax : d3.max(arr);
  let radius = d3.scaleSqrt([0, valmax], [0, k]);

  let rad = [];
  if (nb) {
    let rmin = radius(d3.min(arr));
    let rmax = radius(d3.max(arr));
    let rextent = rmax - rmin;
    if (nb > 2) {
      for (let i = 1; i <= nb - 2; i++) {
        rad.push(rmin + (i * rextent) / (nb - 1));
      }
    }
    rad = [rmin, rad, rmax].flat();
  } else {
    rad = arr.map((d) => radius(d));
  }

  let values = rad.map((d) => radius.invert(d));
  values[0] = d3.min(arr);
  values[values.length - 1] = d3.max(arr);
  values = roundarray(values, round);
  return values.map((d, i) => [d, rad[i]]);
}
