import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

export function simple({
  container,
  id = null,
  data,
  fill = "#e87daf",
  fillOpacity = 1,
}) {
  container
    .append("g")
    .attr("id", id)
    .selectAll("path")
    .data(data.features)
    .join("path")
    .attr("d", d3.geoPath(container.projection))
    .attr("fill", fill)
    .attr("fill-opacity", fillOpacity);
}
