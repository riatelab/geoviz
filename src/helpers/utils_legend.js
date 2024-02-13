import { getsize } from "./getsize";
import { camelcasetodash } from "./camelcase";
import { mergeoptions } from "./mergeoptions"; // SUPPRIMER MERGEOPTIONS
import { unique } from "./unique";

export function manageoptions(options, args, fontFamily) {
  const defaultoptions = {
    // id and position
    mark: "legend",
    id: unique(),
    pos: [0, 0],
    gap: 2,
    // title
    title: "Legend",
    title_fill: "#363636",
    title_fontSize: 16,
    title_fontWeight: "bold",
    title_fontFamily: fontFamily,
    // subtitle
    subtitle_fill: "#363636",
    subtitle_fontSize: 12,
    subtitle_fontFamily: fontFamily,
    // note
    note_fill: "#363636",
    note_fontSize: 10,
    note_fontStyle: "italic",
    note_fontFamily: fontFamily,
    // values
    values_fill: "#363636",
    values_fontSize: 10,
    values_fontFamily: fontFamily,
    values_round: 2,
    values_decimal: ".",
    values_thousands: " ",
    values_dx: 5,
    values_dy: 0,
    values_dominantBaseline: "central",

    // top values
    top_values_fill: "#363636",
    top_values_fontSize: 10,
    top_values_fontFamily: fontFamily,
    top_values_round: 2,
    top_values_decimal: ".",
    top_values_thousands: " ",
    top_values_dx: 5,
    top_values_dy: 0,
    top_values_dominantBaseline: "central",

    // top title
    top_title_fill: "#363636",
    top_title_fontSize: 12,
    top_title_fontFamily: fontFamily,
    top_title_textAnchor: "middle",
    top_title_dominantBaseline: "hanging",

    // bottom title
    bottom_title_fill: "#363636",
    bottom_title_fontSize: 12,
    bottom_title_fontFamily: fontFamily,
    bottom_title_textAnchor: "middle",
    bottom_title_dominantBaseline: "hanging",

    // bottom values
    bottom_values_fill: "#363636",
    bottom_values_fontSize: 10,
    bottom_values_fontFamily: fontFamily,
    bottom_values_round: 2,
    bottom_values_decimal: ".",
    bottom_values_thousands: " ",
    bottom_values_dx: 5,
    bottom_values_dy: 0,
    bottom_values_dominantBaseline: "central",

    // label
    label_fill: "#363636",
    label_fontSize: 10,
    label_dx: 5,
    label_dominantBaseline: "central",
    label_fontFamily: fontFamily,
    // rect
    rect_width: 25,
    rect_height: 17,
    rect_dx: 0,
    rect_dy: 0,
    rect_stroke: "#303030",
    rect_strokeWidth: 0.1,
    rect_spacing: 0,
    // spike
    spike_width: 10,
    spike_dx: 0,
    spike_dy: 0,
    spike_spacing: 3,
    spike_fill: "none",
    spike_stroke: "black",
    // line
    line_fill: "none",
    line_stroke: "#363636",
    line_strokeDasharray: 2,
    line_strokeWidth: 0.7,
    line_length: 10,
    // circle
    circle_dx: 0,
    circle_dy: 0,
    circle_fill: "none",
    circle_stroke: "#363636",
    circle_spacing: 5,

    // top_circle
    top_circle_dx: 0,
    top_circle_dy: 0,
    top_circle_fill: "none",
    top_circle_stroke: "#363636",
    top_circle_spacing: 5,

    // top_circle
    bottom_circle_dx: 0,
    bottom_circle_dy: 0,
    bottom_circle_fill: "none",
    bottom_circle_stroke: "#363636",
    bottom_circle_spacing: 5,

    // missing
    missing: true,
    missing_fill: "white",
    missing_text: "no data",
    // frame
    frame: false,
    frame_fill: "white",
    frame_fillOpacity: 0.5,
    frame_margin: 15,
    frame_stroke: "black",
  };

  return { ...defaultoptions, ...options, ...args };
}

export function addTitle(layer, opts) {
  if (opts.title) {
    const opts_title = Object.assign(
      subsetobj(opts, { prefix: "title_" }),
      subsetobj(opts, { prefix: "text_" })
    );
    opts_title.text = opts.title;
    opts_title.pos = opts.pos;
    addText(layer, opts_title);
  }
}

export function addSubtitle(layer, opts) {
  if (opts.subtitle) {
    const size = getsize(layer);
    const opts_subtitle = Object.assign(
      subsetobj(opts, { prefix: "subtitle_" }),
      subsetobj(opts, { prefix: "text_" })
    );
    opts_subtitle.text = opts.subtitle;
    opts_subtitle.pos = [
      opts.pos[0],
      size.height == 0 ? opts.pos[1] : size.y + size.height + opts.gap,
    ];
    addText(layer, opts_subtitle);
  }
}

export function addNote(layer, opts) {
  if (opts.note) {
    const size = getsize(layer);
    const opts_note = Object.assign(
      subsetobj(opts, { prefix: "note_" }),
      subsetobj(opts, { prefix: "text_" })
    );
    opts_note.text = opts.note;
    opts_note.dy = opts_note.dy !== undefined ? opts_note.dy : 5;
    opts_note.pos = [
      opts.pos[0],
      size.height == 0 ? opts.pos[1] : size.y + size.height + opts.gap,
    ];
    addText(layer, opts_note);
  }
}

export function addFrame(layer, opts) {
  if (opts.frame) {
    const opts_frame = subsetobj(opts, { prefix: "frame_" });
    const size = getsize(layer);
    const frame = layer
      .append("rect")
      .attr("x", size.x - opts_frame.margin)
      .attr("y", size.y - opts_frame.margin)
      .attr("width", size.width + opts_frame.margin * 2)
      .attr("height", size.height + opts_frame.margin * 2)
      .lower();

    Object.entries(opts_frame).forEach((d) =>
      frame.attr(camelcasetodash(d[0]), d[1])
    );
  }
}

export function addText(layer, opts) {
  // Default
  opts = mergeoptions(
    {
      dx: 0,
      dy: 0,
      dominantBaseline: "hanging",
      textAnchor: "start",
      lineSpacing: 0,
      fontSize: 10,
    },
    opts
  );

  let text = layer.append("g");
  Object.entries(opts).forEach((d) => text.attr(camelcasetodash(d[0]), d[1]));

  let pos = { ...opts.pos };
  pos[0] = pos[0] + opts.dx;
  pos[1] = pos[1] + opts.dy;

  if (opts.text.split("\n").length == 1) {
    text.append("text").attr("x", pos[0]).attr("y", pos[1]).text(opts.text);
  } else {
    let delta = 0;
    switch (opts.dominantBaseline) {
      case "hanging":
        delta = 0;
        break;
      case "middle":
      case "central":
        delta = (opts.text.split("\n").length - 1) * opts.fontSize;
        delta = delta / 2;
        break;
      case "auto":
      case "text-top":
        delta = (opts.text.split("\n").length - 1) * opts.fontSize;
        break;
      default:
        delta = 0;
    }

    text
      .selectAll("text")
      .data(opts.text.split("\n"))
      .join("text")
      .attr("x", pos[0])
      .attr(
        "y",
        (d, i) => pos[1] + i * (opts.fontSize + opts.lineSpacing) - delta
      )
      .text((d) => d);
  }
}

// Helpers

export function subsetobj(obj, { prefix, exclude = null } = {}) {
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
