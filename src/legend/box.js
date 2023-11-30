import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash } from "../helpers/camelcase";
import { mergeoptions } from "../helpers/mergeoptions";
import { getsize } from "../helpers/getsize";
import { unique } from "../helpers/unique";
import {
  addTitle,
  addSubtitle,
  addNote,
  subsetobj,
  addText,
} from "./helpers.js";

export function box(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;
  // Arguments
  let opts = mergeoptions(
    {
      mark: "legend",
      id: unique(),
      pos: [0, 0],
      title_fill: "#363636",
      subtitle_fill: "#363636",
      note_fill: "#363636",
      label_fill: "#363636",
      title_fontSize: 16,
      title_fontWeight: "bold",
      subtitle_fontSize: 12,
      note_fontSize: 10,
      note_fontStyle: "italic",
      label: "label",
      label_fontSize: 10,
      label_dx: 5,
      rect_dx: 0,
      rect_dy: 0,
      label_dominantBaseline: "central",
      gap: 2,
      rect_width: 25,
      rect_height: 17,
      rect_fill: "#5d6266",
    },
    newcontainer ? arg1 : arg2
  );

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
