import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

export function simple({
  svg,
  id = null,
  geom,
  fill = "#e87daf",
  fillOpacity = 1,
}) {
  svg
    .append("g")
    .attr("id", id)
    .selectAll("path")
    .data(geom.features)
    .join("path")
    .attr("d", d3.geoPath(svg.projection))
    .attr("fill", fill)
    .attr("fill-opacity", fillOpacity);
}
