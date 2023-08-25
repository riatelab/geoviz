import { tooltip } from "../helpers/tooltip";
import { addattr } from "../helpers/addattr";
import { random } from "../classify/random";
import { unique } from "../helpers/unique";
import { scaleSqrt } from "d3-scale";
import { max, descending } from "d3-array";
const d3 = Object.assign({}, { scaleSqrt, max, descending });

export function bubble(
  svg,
  {
    id = unique(),
    data,
    r = 10,
    k = 50,
    fixmax = null,
    fill = random(),
    stroke = "white",
    tip,
    tip_style,
  } = {}
) {
  // radius
  const valmax =
    fixmax != undefined
      ? fixmax
      : d3.max(data.features, (d) => Math.abs(+d.properties[r]));
  let radius = d3.scaleSqrt([0, valmax], [0, k]);

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

  layer
    .selectAll("circle")
    .data(
      data.features
        .filter((d) => d.geometry.coordinates != undefined)
        .filter((d) => d.properties[r] != undefined)
        .sort((a, b) =>
          d3.descending(Math.abs(+a.properties[r]), Math.abs(+b.properties[r]))
        )
    )
    .join("circle")
    .attr("cx", (d) => svg.projection(d.geometry.coordinates)[0])
    .attr("cy", (d) => svg.projection(d.geometry.coordinates)[1])
    .attr("r", (d) => radius(Math.abs(d.properties[r])));

  if (tip) {
    tooltip(layer, svg, tip, tip_style);
  }

  return `#${id}`;
}
