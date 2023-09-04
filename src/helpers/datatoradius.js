import { scaleSqrt } from "d3-scale";
import { min, max, ascending } from "d3-array";
const d3 = Object.assign({}, { min, max, scaleSqrt, ascending });
import { isNumber } from "./isnuber";

export function datatoradius(data, k, fixmax, nb) {
  let arr = data
    .filter((d) => isNumber(d))
    .map((d) => Math.abs(d))
    .sort(d3.ascending);
  const valmax = fixmax != undefined ? fixmax : d3.max(arr);
  let radius = d3.scaleSqrt([0, valmax], [0, k]);
  let rmax = radius(d3.max(arr));

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

  let values = arr.map((d) => radius.invert(d));

  return values.map((d, i) => [d, rad[i]]);
}
