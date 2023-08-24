import { geoGraticule, geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoGraticule });
import { addattr } from "../helpers/addattr";

export function graticule(
  svg,
  {
    id = null,
    step = 10,
    stroke = "red",
    strokeWidth = 0.8,
    strokeOpacity = 1,
    strokeLinecap = "square",
    strokeLinejoin = "round",
    strokeDasharray = 2,
  } = {}
) {
  step = Array.isArray(step) ? step : [step, step];

  let layer = svg
    .append("g")
    .attr("id", id)
    .attr("fill", "none")
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("stroke-opacity", strokeOpacity)
    .attr("stroke-linecap", strokeLinecap)
    .attr("stroke-linejoin", strokeLinejoin)
    .attr("stroke-dasharray", strokeDasharray);

  // ...styles
  addattr({
    layer,
    args: arguments[1],
    exclude: [],
  });

  layer
    .append("path")
    .datum(d3.geoGraticule().step(step))
    .attr("d", d3.geoPath(svg.projection));
}
