import { geoPath } from "d3-geo";
import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
const d3 = Object.assign({}, { geoPath });

export function outline(
  svg,
  {
    id = unique(),
    fill = "#B5DFFD",
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

  // Attr with specific default values
  layer
    .attr("fill", fill)
    .attr("fill-opacity", fillOpacity)
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth);

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fill", "fillOpacity", "stroke", "strokeWidth"],
  });

  layer
    .append("path")
    .attr("d", d3.geoPath(svg.projection)({ type: "Sphere" }));

  return `#${id}`;
}
