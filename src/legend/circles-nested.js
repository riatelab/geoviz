import { scaleSqrt } from "d3-scale";
import { min, max, descending } from "d3-array";
const d3 = Object.assign({}, { min, max, scaleSqrt, descending });
import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { isNumber } from "../helpers/isnuber";

export function circles_nested(
  svg,
  { data, pos = [10, 10], id = unique(), k = 50, fixmax = null, nb = 4 } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();
  layer.attr("transform", `translate(${pos})`);
  layer.append("circle").attr("r", 4).attr("fill", "red");

  // Title
  let dy = legtitle(layer, arguments[1], "title", 0);

  // Subtitle
  dy = legtitle(layer, arguments[1], "subtitle", dy);

  // Circles
  let span = 7;
  let arr = data
    .filter((d) => isNumber(d))
    .map((d) => Math.abs(d))
    .sort(d3.descending);
  const valmax = fixmax != undefined ? fixmax : d3.max(arr);
  let radius = d3.scaleSqrt([0, valmax], [0, k]);
  let rmax = radius(d3.max(arr));

  if (nb) {
    let newarr = [];
    let rmin = radius(d3.min(arr));
    let rmax = radius(d3.max(arr));
    let rextent = rmax - rmin;
    if (nb > 2) {
      for (let i = 1; i <= nb - 2; i++) {
        newarr.push(rmin + (i * rextent) / (nb - 1));
      }
    }

    arr = [rmin, newarr, rmax].flat();
  }
  let values = arr.map((d) => radius.invert(d));

  let nestedcircles = layer
    .append("g")
    .attr("fill", "none")
    .attr("stroke", "red");

  nestedcircles
    .selectAll("circle")
    .data(arr)
    .join("circle")
    .attr("r", (d) => d)
    .attr(
      "transform",
      (d) => `translate(${rmax}, ${span + dy + rmax * 2 - d})`
    );

  nestedcircles
    .selectAll("line")
    .data(arr)
    .join("line")
    .attr("x1", rmax)
    .attr("x2", rmax + rmax + 10)
    .attr("y1", (d) => span + dy + rmax * 2 - d * 2)
    .attr("y2", (d) => span + dy + rmax * 2 - d * 2);

  nestedcircles
    .selectAll("text")
    .data(values)
    .join("text")
    .attr("x", rmax + rmax + 15)
    .attr("y", (d, i) => span + dy + rmax * 2 - arr[i] * 2)
    .text((d) => d)
    .attr("dominant-baseline", "middle");

  // Note
  dy = legtitle(layer, arguments[1], "note", dy + rmax * 2 + span * 2);
  return `#${id}`;
}
