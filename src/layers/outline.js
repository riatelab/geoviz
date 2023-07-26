import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

export function outline({
  svg,
  id = null,
  fill = "#a1d8f7",
  fillOpacity = 1,
  stroke = 0,
  strokeWidth = 0,
}) {
  svg
    .append("g")
    .attr("id", id)
    .append("path")
    .attr("d", d3.geoPath(svg.projection)({ type: "Sphere" }))
    .attr("fill", fill)
    .attr("fill-opacity", fillOpacity)
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth);
}
