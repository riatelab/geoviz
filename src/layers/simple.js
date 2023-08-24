import { tooltip } from "../helpers/tooltip";
import { addattr } from "../helpers/addattr";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

export function simple(
  svg,
  { id = null, data, tip, tip_style, fill = "#e87daf", stroke = "white" } = {}
) {
  // remove
  svg.select(`g.${id}`).remove();

  // init layer
  let layer = svg
    .append("g")
    .attr("id", id)
    .attr("fill", fill)
    .attr("stroke", stroke);

  // ...styles
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fill", "stroke"],
  });

  // draw
  layer
    .selectAll("path")
    .data(data.features)
    .join("path")
    .attr("d", d3.geoPath(svg.projection));

  // Tooltip
  if (tip) {
    tooltip(layer, svg, tip, tip_style);
  }
}
