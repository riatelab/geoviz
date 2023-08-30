import { extent } from "../helpers/extent";
import { create } from "d3-selection";
import { geoPath, geoBounds, geoEquirectangular } from "d3-geo";
const d3 = Object.assign(
  {},
  { create, geoPath, geoBounds, geoEquirectangular }
);

/**
 * The `init` function is the first step in map construction.
 * It creates an svg container into which the various layers can be added.
 *
 * @param {object} param0 - An objet defining the container
 * @param {number} param0.height - Height of the container
 * @param {number} param0.width - Width of the container. This value is automatically calculated according to `domain`. But it can be forced by entering a value.
 * @param {object|object[]} param0.domain - The domain corresponds to the geographical area to be displayed. It is defined by a geoJSON or an array containing geoJSONs. By default, the entire world is represented.
 * @param {function} param0.projection - Projection definition. See [d3-geo](https://github.com/d3/d3-geo) & [d3-geo-projection](https://github.com/d3/d3-geo-projection)
 * @param {number[]} param0.pos - Position of the container (if contained in another svg container)
 * @param {string} param0.background - Background color
 * @param {number|number[]} param0.margin - Margins around the map. A number to set the same margin everywhere or an array [top, right, bottom, left] to set different margins.
 * @param {object} param0.parent - Name of parent container into which this child container is to be included. In this case, the param0.pos parameter is also used.
 * @example
 * let main = container.init({width: 500, background: "lightblue"})
 * @returns {SVGSVGElement} - The function returns a svg container + some information about this container:`projection`, `margin`, `width`, `height` and `bbox`
 */

export function init({
  height = null,
  projection = d3.geoEquirectangular(),
  domain,
  pos = [0, 0],
  background = "none",
  width = 1000,
  margin = [0, 0, 0, 0],
  parent = null,
} = {}) {
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
    let svg = d3
      .create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("background-color", background);

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
