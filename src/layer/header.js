import { addattrlegend } from "../helpers/addattrlegend";
import { unique } from "../helpers/unique";
import { getsize } from "../helpers/getsize";

export function header(
  svg,
  {
    id = unique(),
    text = "Map title",
    rect_fill = "white",
    rect_fillOpacity = 0.4,
    fontSize = 30,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Height
  let tmp = layer
    .append("text")
    .attr("x", 100)
    .attr("font-size", fontSize)
    .attr("font-family", svg.fontFamily || fontFamily)
    .text(text);
  let txt_height = getsize(tmp).height;
  tmp.remove();

  // Background
  let rect = layer
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svg.width)
    .attr("height", txt_height)
    .attr("fill", rect_fill)
    .attr("fill-opacity", rect_fillOpacity);

  // ...attr
  addattrlegend({
    params: arguments[1] || {},
    layer: rect,
    prefix: "rect",
  });

  layer
    .append("text")
    .attr("x", svg.width / 2)
    .attr("y", txt_height / 2)
    .attr("text-anchor", "middle")
    .attr("font-family", svg.fontFamily || fontFamily)
    .attr("dominant-baseline", "middle")
    .attr("font-size", fontSize)
    .attr("fill", "#242323")
    .text(text);

  return `#${id}`;
}
