import { extent } from "../helpers/extent";
import { create } from "d3-selection";
import { geoPath, geoBounds, geoEquirectangular } from "d3-geo";
const d3 = Object.assign(
  {},
  { create, geoPath, geoBounds, geoEquirectangular }
);

export function init({
  projection = d3.geoEquirectangular(),
  domain,
  background = "none",
  width = 1000,
  margin = [0, 0, 0, 0],
}) {
  // adapt scale
  let ref = extent(domain);
  margin = Array.isArray(margin) ? margin : Array(4).fill(margin);
  const [[x0, y0], [x1, y1]] = d3
    .geoPath(projection.fitWidth(width - margin[1] - margin[3], ref))
    .bounds(ref);

  const height = Math.ceil(y1 - y0) + margin[0] + margin[2];

  let trans = projection.translate();
  projection.translate([trans[0] + margin[3], trans[1] + margin[0]]);

  let svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .style("background-color", background);

  return Object.assign(svg, {
    projection,
    margin,
    width,
    height,
    bbox: d3.geoBounds(ref),
  });
}
