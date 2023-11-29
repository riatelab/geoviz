import { create } from "../container/create";
import { render } from "../container/render";
import { text } from "../mark/text";
import { camelcasetodash } from "../helpers/camelcase";
import { mergeoptions } from "../helpers/mergeoptions";
import { getsize } from "../helpers/getsize";
import { unique } from "../helpers/unique";

export function leg(arg1, arg2) {
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
      text_fill: "#363636",
      title_fontSize: 16,
      title_fontWeight: "bold",
      subtitle_fontSize: 12,
      note_fontSize: 10,
      note_fontStyle: "italic",
      label: "label",
      label_fontStyle: 8,
      label_dx: 5,
      rect_dx: 0,
      rect_dy: 0,
      label_dominantBaseline: "central",
      gap: 2,
      rect_width: 25,
      rect_height: 17,
    },
    newcontainer ? arg1 : arg2
  );

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Specific attributes
  let entries = Object.entries(opts).map((d) => d[0]);
  const attr = entries.filter((d) => !["mark", "id"].includes(d));

  let pos = opts.pos;
  let size = {};

  // Global texts parameters
  let opts_text = subsetobj(opts, { prefix: "text_" });

  // title
  if (opts.title) {
    let opts_title = subsetobj(opts, { prefix: "title_" });
    opts_title = Object.assign(opts_title, opts_text);
    opts_title.text = opts.title;
    opts_title.pos = pos;
    text(layer, opts_title);
  }

  // subtitle
  if (opts.subtitle) {
    size = getsize(layer);
    let opts_subtitle = subsetobj(opts, { prefix: "subtitle_" });
    opts_subtitle = Object.assign(opts_subtitle, opts_text);
    opts_subtitle.text = opts.subtitle;
    opts_subtitle.pos = [
      pos[0],
      size.height == 0 ? pos[1] : size.y + size.height + opts.gap,
    ];
    text(layer, opts_subtitle);
  }

  // Box
  size = getsize(layer);
  let opts_rect = subsetobj(opts, { prefix: "rect_", exclude: ["dx", "dy"] });
  opts_rect.x = pos[0] + opts_rect.dx;
  opts_rect.y =
    size.height == 0
      ? pos[1] + opts_rect.dy
      : size.y + size.height + opts.gap + opts_rect.dy;
  let box = layer.append("rect");
  Object.entries(opts_rect).forEach((d) =>
    box.attr(camelcasetodash(d[0]), d[1])
  );

  // Label
  size = getsize(layer);
  let opts_label = subsetobj(opts, { prefix: "label_" });
  opts_label.text = opts.label;
  opts_label.pos = [
    pos[0] + opts_rect.width,
    pos[1] + size.height - opts_rect.height / 2, // CORRIGER ICI
  ];
  text(layer, opts_label);

  // note
  if (opts.note) {
    size = getsize(layer);
    let opts_note = subsetobj(opts, { prefix: "note_" });
    opts_note = Object.assign(opts_note, opts_text);
    opts_note.text = opts.note;
    opts_note.pos = [
      pos[0],
      size.height == 0 ? pos[1] : size.y + size.height + opts.gap,
    ];
    text(layer, opts_note);
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

// SUBSET OBJ
function subsetobj(obj, { prefix, exclude = null } = {}) {
  let output = {};
  let arr = Object.entries(obj)
    .map((d) => d[0])
    .filter((s) => s.includes(prefix))
    .filter((s) => !s.includes(exclude));

  arr.forEach((d) =>
    Object.assign(output, { [d.replace(prefix, "")]: obj[d] })
  );
  return output;
}
