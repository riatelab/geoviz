import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash } from "../helpers/camelcase";
import { getsize } from "../helpers/getsize";

import {
  addTitle,
  addSubtitle,
  addNote,
  subsetobj,
  addText,
  addFrame,
  manageoptions,
} from "../helpers/utils_legend.js";

export function box(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;

  // Arguments
  const options = {
    title: undefined,
    label: "label",
    rect_fill: "#5d6266",
  };
  let opts = manageoptions(options, newcontainer ? arg1 : arg2, svg.fontFamily);

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();
  opts = subsetobj(opts, { prefix: "", exclude: ["id", "mark"] });

  // Title
  addTitle(layer, opts);

  // Subtitle
  addSubtitle(layer, opts);

  // Box
  let size = getsize(layer);
  let opts_rect = subsetobj(opts, { prefix: "rect_", exclude: ["dx", "dy"] });
  opts_rect.x = opts.pos[0] + opts_rect.dx;
  opts_rect.y =
    size.height == 0
      ? opts.pos[1] + opts_rect.dy
      : size.y + size.height + opts.gap + opts_rect.dy;
  let box = layer.append("rect");
  Object.entries(opts_rect).forEach((d) =>
    box.attr(camelcasetodash(d[0]), d[1])
  );

  // Label

  size = getsize(layer);
  const opts_label = Object.assign(
    subsetobj(opts, { prefix: "label_" }),
    subsetobj(opts, { prefix: "text_" })
  );
  opts_label.text = opts.label;
  opts_label.pos = [
    opts.pos[0] + opts_rect.width,
    opts.pos[1] + size.height - opts_rect.height / 2, // CORRIGER ICI
  ];
  addText(layer, opts_label);

  // Note
  addNote(layer, opts);

  // Frame
  if (opts.frame) {
    addFrame(layer, opts);
  }

  // Output;
  if (newcontainer) {
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
