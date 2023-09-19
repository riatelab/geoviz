import { addattrlegend } from "../helpers/addattrlegend";
import { unique } from "../helpers/unique";
import { getsize } from "../helpers/getsize";

export function header(
  svg,
  {
    id = unique(),
    text = "Map title",
    rect_fill = "black",
    rect_fillOpacity = 0.15,
    fontSize = 30,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  console.log(arguments[1]);

  // Height
  let tmp = layer.append("text").attr("font-size", fontSize).text(text);
  let txt_height = getsize(tmp).height;
  tmp.remove();

  // Background
  let rect = layer
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svg.width)
    .attr("height", txt_height + txt_height / 4)
    .attr("fill", rect_fill)
    .attr("fill-opacity", rect_fillOpacity);

  // ...attr
  addattrlegend({
    params: arguments[1] || {},
    layer: rect,
    prefix: "rect",
  });

  // ATTENTION FONT FAMILIY !! TODO

  let mytext = layer
    .append("text")
    .attr("x", svg.width / 2)
    .attr("y", (txt_height + txt_height / 4) / 2)
    .attr("text-anchor", "middle")
    .attr("fontFamilly", null)
    .attr("dominant-baseline", "central")
    .attr("font-size", fontSize)
    .attr("fill", "#242323")
    .text(text);

  return `#${id}`;
}
