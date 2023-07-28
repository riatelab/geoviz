import { geoPath } from "d3-geo";
import { tooltip } from "../helpers/tooltip";
const d3 = Object.assign({}, { geoPath });

export function simple(
  svg,
  {
    id = null,
    data,
    fill = "#e87daf",
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
    .attr("fill", fill)
    .attr("fill-opacity", fillOpacity)
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-opacity", strokeOpacity)
    .selectAll("path")
    .data(data.features)
    .join("path")
    .attr("d", d3.geoPath(svg.projection));

  if (tip) {
    tooltip(layer, svg, tip, tip_style);
  }
}
