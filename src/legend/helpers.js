import { getsize } from "../helpers/getsize";
import { camelcasetodash } from "../helpers/camelcase";
import { mergeoptions } from "../helpers/mergeoptions";

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
    console.log(opts_frame);
    const size = getsize(layer);
    console.log(size);
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
