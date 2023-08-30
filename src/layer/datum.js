import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

/**
 * Generate a layer with geometries (datum)
 */
export function datum(svg, { id = unique(), data, geocoords = true } = {}) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: [],
  });

  // draw
  const projection = geocoords ? svg.projection : null;
  layer.append("path").datum(data).attr("d", d3.geoPath(projection));

  return `#${id}`;
}
