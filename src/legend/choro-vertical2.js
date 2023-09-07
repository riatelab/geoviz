import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { roundarray } from "../helpers/rounding";
import { addattrlegend } from "../helpers/addattrlegend";
import { formatLocale } from "d3-format";
import { descending, extent } from "d3-array";
import { scaleLinear } from "d3-scale";
const d3 = Object.assign({}, { formatLocale, descending, extent, scaleLinear });

export function choro_vertical2(
  svg,
  {
    pos = [10, 10],
    id = unique(),
    breaks = [],
    colors = [],
    missing = true,
    missing_fill = "white",
    missing_text = "no data",
    values_round = 2,
    values_decimal = ".",
    values_thousands = " ",
    gap = 10,
    rect_gap = 0,
    rect_width = 25,
    rect_height = 300,
    values_dx = 5,
    reverse = false,
    rect_stroke = "white",
    rect_strokeWidth = 0.3,
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

  // Scaling
  let scale = d3
    .scaleLinear()
    .domain(d3.extent(breaks)) // unit: km
    .range([0, rect_height]); // unit: pixels

  // Vertical boxes layer
  let verticalchoro = layer.append("g");

  // Rect

  let rect = verticalchoro
    .append("g")
    .attr("stroke", rect_stroke)
    .attr("stroke-opacity", rect_strokeWidth);

  rect
    .selectAll("rect")
    .data(colors)
    .join("rect")
    .attr("x", 0)
    .attr("y", (d, i) => scale(breaks[i + 1] - breaks[0]))
    .attr("width", rect_width)
    .attr("height", (d, i) => scale(breaks[i + 1] - breaks[i]))
    .attr("fill", (d) => d)
    .attr("fill-opacity", 0.3)
    .attr("stroke", "black");

  // Note
  dy = legtitle(
    layer,
    arguments[1],
    "note",
    dy +
      gap +
      colors.length * rect_height +
      colors.length * rect_gap +
      gap +
      (missing ? rect_height + rect_gap + gap : 0)
  );
  return `#${id}`;
}
