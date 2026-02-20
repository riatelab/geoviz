import { select } from "d3-selection";
const d3 = Object.assign({}, { select });
import { create } from "../container/create";
import { render } from "../container/render";
import { unique, getsize } from "../helpers/utils";

/**
 * @function ehatchmpty
 * @description
 * Create an empty SVG layer (<g>) with a specific id.
 * This layer can later be reused as a target to draw or attach a mark.
 * @property {string} [id] - id of the layer
 */

export function hatch(arg1, arg2) {
  // Detect whether a new SVG container must be created
  const newContainer = !arg2 && !arg1?._groups;
  arg1 = newContainer && !arg1 ? {} : arg1;
  arg2 = arg2 || {};

  // Options
  const opts = {
    mark: "hatch",
    id: unique(),
    spacing: 8,
    angle: 45,
    visibility: true,
    stroke: "#786d6c",
    strokeWidth: 2,
    strokeDasharray: "none",
    strokeOpacity: 0.1,
    ...(newContainer ? arg1 : arg2),
  };

  // Defs
  let defs = svg.select("#defs");
  defs.select(`#${opts.id}`).remove();

  const pattern = defs
    .append("pattern")
    .attr("class", "pattern" + opts.id)
    .attr("id", opts.id)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", opts.spacing)
    .attr("height", opts.spacing)
    .attr("patternTransform", `rotate(${angle})`);

  pattern
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", 0)
    .attr("y1", opts.spacing)
    .attr("visibility", opts.visibility)
    .attr("stroke", opts.stroke)
    .attr("stroke-linejoin", "butt")
    .attr("stroke-width", opts.strokeWidth)
    .attr("stroke-dasharray", opts.strokeDasharray)
    .attr("stroke-opacity", opts.strokeOpacity);

  // Create or reuse the SVG container
  const svg = newContainer ? create() : arg1;

  // Create or select the empty layer
  let layer = svg.select(`#${opts.id}`);
  if (layer.empty()) {
    layer = svg.append("g").attr("id", opts.id).attr("data-layer", "hatch");
  }

  // Hatch
  layer
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svg.width)
    .attr("height", svg.height)
    .attr("fill", "url('#hatch" + opts.id + "')");

  // Return rendered SVG or layer selector
  if (newContainer) {
    const size = getsize(layer);
    svg
      .attr("width", size.width)
      .attr("height", size.height)
      .attr("viewBox", [size.x, size.y, size.width, size.height]);
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
