import { tooltip } from "../helpers/tooltip";
import { addattr } from "../helpers/addattr";
import { randomcolor } from "../helpers/randomcolor";
import { implantation } from "../helpers/implantation";
import { unique } from "../helpers/unique";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

export function simple(
  svg,
  {
    id = unique(),
    data,
    tip,
    tip_style,
    fill = implantation(data) == 2 ? "none" : randomcolor(),
    stroke = implantation(data) == 2 ? randomcolor() : "white",
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Attr with specific default values
  layer.attr("fill", fill).attr("stroke", stroke);

  // ...attr
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

  return `#${id}`;
}
