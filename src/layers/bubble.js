import { tooltip } from "../helpers/tooltip";

export function bubble(
  svg,
  {
    id = null,
    data,
    fill = "red",
    fillOpacity = 1,
    stroke = "black",
    strokeWidth = 1,
    strokeOpacity = 1,
    tip,
    tip_style,
  } = {}
) {
  let layer = svg
    .append("g")
    .attr("id", id)
    .attr("fill", fill)
    .attr("fill-opacity", fillOpacity)
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-opacity", strokeOpacity)
    .selectAll("circle")
    .data(data.features)
    .join("circle")
    .attr("cx", (d) => svg.projection(d.geometry.coordinates)[0])
    .attr("cy", (d) => svg.projection(d.geometry.coordinates)[1])
    .attr("r", 15);

  if (tip) {
    tooltip(layer, svg, tip, tip_style);
  }
}
