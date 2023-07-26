import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

export function outline({
  container,
  id = null,
  fill = "#a1d8f7",
  fillOpacity = 1,
  stroke = 0,
  strokeWidth = 0,
}) {
  container
    .append("g")
    .attr("id", id)
    .append("path")
    .attr("d", d3.geoPath(container.projection)({ type: "Sphere" }))
    .attr("fill", fill)
    .attr("fill-opacity", fillOpacity)
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth);
}
