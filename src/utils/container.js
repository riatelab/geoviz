import { extent } from "../helpers/extent";
import { create } from "d3-selection";
import { geoPath, geoBounds, geoEquirectangular } from "d3-geo";
const d3 = Object.assign(
  {},
  { create, geoPath, geoBounds, geoEquirectangular }
);

export function container({
  parent = null,
  projection = d3.geoEquirectangular(),
  domain,
  pos = [0, 0],
  background = "none",
  width = 1000,
  height = null,
  margin = [0, 0, 0, 0],
}) {
  let info;
  if (height !== null) {
    info = { width, height };
  } else {
    //adapt scale
    let ref = extent(domain);
    margin = Array.isArray(margin) ? margin : Array(4).fill(margin);
    const [[x0, y0], [x1, y1]] = d3
      .geoPath(projection.fitWidth(width - margin[1] - margin[3], ref))
      .bounds(ref);

    height = Math.ceil(y1 - y0) + margin[0] + margin[2];

    let trans = projection.translate();
    projection.translate([trans[0] + margin[3], trans[1] + margin[0]]);
    info = {
      projection,
      margin,
      width,
      height,
      bbox: d3.geoBounds(ref),
    };
  }

  if (parent == null) {
    console.log(height);
    let svg = d3
      .create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("background-color", background);

    svg.append("g").attr("id", "_geoviztooltip");

    return Object.assign(svg, info);
  } else {
    let inset = parent
      .append("g")
      .attr("transform", `translate(${pos[0]},${pos[1]})`);
    inset
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", background);

    return Object.assign(inset, info);
  }
}
