import { geoGraticule, geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoGraticule });

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

  svg
    .append("g")
    .attr("id", id)
    .append("path")
    .datum(d3.geoGraticule().step(step))
    .attr("d", d3.geoPath(svg.projection))
    .style("fill", "none")
    .style("stroke", stroke)
    .style("stroke-width", strokeWidth)
    .style("stroke-opacity", strokeOpacity)
    .style("stroke-linecap", strokeLinecap)
    .style("stroke-linejoin", strokeLinejoin)
    .style("stroke-dasharray", strokeDasharray);
}
