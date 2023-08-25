import { tooltip } from "../helpers/tooltip";
import { addattr } from "../helpers/addattr";
import { randomcolor } from "../helpers/randomcolor";
import { unique } from "../helpers/unique";

export function bubble(
  svg,
  {
    id = unique(),
    data,
    fill = randomcolor(),
    stroke = "white",
    tip,
    tip_style,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Attr with specific default values
  layer.attr("fill", fill).attr("stroke", stroke);

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fill", "stroke"],
  });

  layer
    .selectAll("circle")
    .data(data.features)
    .join("circle")
    .attr("cx", (d) => svg.projection(d.geometry.coordinates)[0])
    .attr("cy", (d) => svg.projection(d.geometry.coordinates)[1])
    .attr("r", 15);

  if (tip) {
    tooltip(layer, svg, tip, tip_style);
  }

  return `#${id}`;
}
