import { tooltip } from "../helpers/tooltip";
import { addattr } from "../helpers/addattr";
import { random } from "../classify/random";
import { implantation } from "../helpers/implantation";
import { unique } from "../helpers/unique";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

export function simple(
  svg,
  {
    id = unique(),
    project = true,
    data,
    tip,
    tip_style,
    fill = implantation(data) == 2 ? "none" : random(),
    stroke = implantation(data) == 2 ? random() : "white",
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fill", "stroke"],
  });

  // draw
  const projection = project ? svg.projection : null;

  layer
    .selectAll("path")
    .data(data.features.filter((d) => d.geometry !== null))
    .join("path")
    .attr("d", d3.geoPath(projection))
    .attr("fill", fill)
    .attr("stroke", stroke);

  // Tooltip
  if (tip) {
    tooltip(layer, svg, tip, tip_style);
  }

  return `#${id}`;
}
