import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { datatoradius } from "../helpers/datatoradius";
import { addattrlegend } from "../helpers/addattrlegend";
import { formatLocale } from "d3-format";
const d3 = Object.assign({}, { formatLocale });

export function circles_nested(
  svg,
  {
    data,
    pos = [10, 10],
    id = unique(),
    k = 50,
    fixmax = null,
    nb = 4,
    lineLength = 10,
    values_round = 2,
    values_decimal = ".",
    values_thousands = " ",
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();
  layer.attr("transform", `translate(${pos})`);

  // Title
  let dy = legtitle(layer, arguments[1], "title", 0);

  // Subtitle
  dy = legtitle(layer, arguments[1], "subtitle", dy);

  // Circles
  let span = 7;
  let arr = datatoradius(data, { nb, round: values_round, fixmax, k });
  let rmax = arr[arr.length - 1][1];

  let nestedcircles = layer.append("g");

  // Circles
  let circles = nestedcircles
    .selectAll("circle")
    .data(arr.reverse())
    .join("circle")
    .attr("r", (d) => d[1])
    .attr(
      "transform",
      (d) => `translate(${rmax}, ${span + dy + rmax * 2 - d[1]})`
    )
    .attr("fill", "none")
    .attr("stroke", "#363636");
  addattrlegend({
    params: arguments[1],
    layer: circles,
    prefix: "circles",
  });

  // Lines
  let lines = nestedcircles
    .selectAll("line")
    .data(arr)
    .join("line")
    .attr("x1", rmax)
    .attr("x2", rmax + rmax + lineLength)
    .attr("y1", (d) => span + dy + rmax * 2 - d[1] * 2)
    .attr("y2", (d) => span + dy + rmax * 2 - d[1] * 2)
    .attr("fill", "none")
    .attr("stroke", "#363636")
    .attr("stroke-dasharray", 2)
    .attr("stroke-width", 0.7);
  addattrlegend({
    params: arguments[1],
    layer: lines,
    prefix: "lines",
  });

  // Values
  let locale = d3.formatLocale({
    decimal: values_decimal,
    thousands: values_thousands,
    grouping: [3],
  });

  let values = nestedcircles
    .selectAll("text")
    .data(arr)
    .join("text")
    .attr("x", rmax + rmax + lineLength + 5)
    .attr("y", (d) => span + dy + rmax * 2 - d[1] * 2)
    .text((d) => locale.format(",")(d[0]))
    .attr("dominant-baseline", "middle")
    .attr("font-size", 10)
    .attr("fill", "#363636");
  addattrlegend({
    params: arguments[1],
    layer: values,
    prefix: "values",
    text: true,
  });

  // Note
  dy = legtitle(layer, arguments[1], "note", dy + rmax * 2 + span * 2);
  return `#${id}`;
}
