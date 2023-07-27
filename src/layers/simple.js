import { geoPath } from "d3-geo";
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
  } = {}
) {
  // svg
  //   .append("g")
  //   .attr("id", id)
  //   .append("path")
  //   .datum(data)
  //   .attr("d", d3.geoPath(svg.projection))
  //   .attr("fill", fill)
  //   .attr("fill-opacity", fillOpacity)
  //   .attr("stroke", stroke)
  //   .attr("stroke-width", strokeWidth)
  //   .attr("stroke-opacity", strokeOpacity);

  svg
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
}
