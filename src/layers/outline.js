import { geoPath } from "d3-geo";
import { addattr } from "../helpers/addattr";
const d3 = Object.assign({}, { geoPath });

export function outline(
  svg,
  {
    id = null,
    fill = "#a1d8f7",
    fillOpacity = 1,
    stroke = 0,
    strokeWidth = 0,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Styles with specific default values
  layer
    .attr("fill", fill)
    .attr("fill-opacity", fillOpacity)
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth);

  // ...styles
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fill", "fillOpacity", "stroke", "strokeWidth"],
  });

  layer
    .append("path")
    .attr("d", d3.geoPath(svg.projection)({ type: "Sphere" }));
}
