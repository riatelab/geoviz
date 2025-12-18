import { select } from "d3-selection";

const d3 = Object.assign({}, { select });

import { create } from "../container/create";
import { render } from "../container/render";
import { unique, getsize } from "../helpers/utils";

/**
 * @function empty
 * @description
 * Create an empty SVG layer (<g>) with a specific id.
 * This layer can later be reused as a target to draw or attach a mark.
 * @property {string} [id] - id of the layer
 */

export function empty(arg1, arg2) {
  // Detect whether a new SVG container must be created
  const newContainer = !arg2 && !arg1?._groups;
  arg1 = newContainer && !arg1 ? {} : arg1;
  arg2 = arg2 || {};

  // Options
  const opts = {
    id: unique(),
    ...(newContainer ? arg1 : arg2),
  };

  // Create or reuse the SVG container
  const svg = newContainer ? create() : arg1;

  // Create or select the empty layer
  let layer = svg.select(`#${opts.id}`);
  if (layer.empty()) {
    layer = svg.append("g").attr("id", opts.id).attr("data-layer", "empty");
  }

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
