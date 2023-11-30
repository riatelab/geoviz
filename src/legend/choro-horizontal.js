import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash } from "../helpers/camelcase";
import { mergeoptions } from "../helpers/mergeoptions";
import { roundarray } from "../helpers/rounding";
import { getsize } from "../helpers/getsize";
import { unique } from "../helpers/unique";
import {
  addTitle,
  addSubtitle,
  addNote,
  subsetobj,
  addText,
  addFrame,
} from "./helpers.js";
import { formatLocale } from "d3-format";
const d3 = Object.assign({}, { formatLocale });

export function choro_horizontal(arg1, arg2) {
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
      title: "Legend",
      pos: [0, 0],
      breaks: [1, 2, 3, 4, 5],
      colors: ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"],
      missing: true,
      missing_fill: "white",
      missing_text: "no data",
      values_round: 2,
      values_decimal: ".",
      values_thousands: " ",
      values_dx: 5,
      values_dy: 0,
      title_fill: "#363636",
      subtitle_fill: "#363636",
      note_fill: "#363636",
      values_fill: "#363636",
      values_fontSize: 10,
      values_dominantBaseline: "central",
      values_textAnchor: "middle",
      values_dx: 0,
      values_dy: 5,
      title_fontSize: 16,
      title_fontWeight: "bold",
      subtitle_fontSize: 12,
      note_fontSize: 10,
      note_fontStyle: "italic",
      rect_dx: 0,
      rect_dy: 0,
      rect_stroke: "#303030",
      rect_strokeWidth: 0.1,
      rect_spacing: 0,
      gap: 2,
      rect_width: 50,
      rect_height: 14,
      rect_fill: "#5d6266",
      missing: true,
      missing_fill: "white",
      missing_text: "no data",
      frame: false,
      frame_fill: "white",
      frame_fillOpacity: 0.5,
      frame_margin: 15,
      frame_stroke: "black",
    },
    newcontainer ? arg1 : arg2
  );

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Title
  addTitle(layer, opts);

  // Subtitle
  addSubtitle(layer, opts);

  // values
  let locale = d3.formatLocale({
    decimal: opts.values_decimal,
    thousands: opts.values_thousands,
    grouping: [3],
  });

  let values = layer.append("g");
  let size = getsize(layer);
  const opts_values = Object.assign(
    subsetobj(opts, { prefix: "values_" }),
    subsetobj(opts, { prefix: "text_" })
  );

  Object.entries(opts_values).forEach((d) =>
    values.attr(camelcasetodash(d[0]), d[1])
  );

  // Boxes
  let rect = layer.append("g");
  let opts_rect = subsetobj(opts, {
    prefix: "rect_",
    exclude: ["fill", "width", "height", "spacing"],
  });
  Object.entries(opts_rect).forEach((d) =>
    rect.attr(camelcasetodash(d[0]), d[1])
  );

  let posy = opts.pos[1] + size.height + opts.gap + opts.rect_dy;
  let posx = opts.pos[0] + opts.rect_dx;

  rect
    .selectAll("rect")
    .data(!opts.reverse ? opts.colors : opts.colors.slice().reverse())
    .join("rect")
    .attr("x", (d, i) => posx + i * (opts.rect_spacing + opts.rect_width))
    .attr("y", posy)
    .attr("width", opts.rect_width)
    .attr("height", opts.rect_height)
    .attr("fill", "red")
    .attr("fill", (d) => d);

  // Values
  size = getsize(layer);
  values
    .selectAll("text")
    .data(
      !opts.reverse
        ? roundarray(opts.breaks, opts.values_round)
        : roundarray(opts.breaks.slice().reverse(), opts.values_round)
    )
    .join("text")
    .attr(
      "x",
      (d, i) =>
        opts.pos[0] + i * (opts.rect_width + opts.rect_spacing) + opts.values_dx
    )
    .attr("y", opts.pos[1] + size.height + opts.gap + opts.values_dy)
    .text((d) => locale.format(",")(d));

  // Missing
  if (opts.missing) {
    let missing = layer.append("g");
    let size = getsize(layer);
    let opts_rect = subsetobj(opts, { prefix: "rect_", exclude: ["dx", "dy"] });
    opts_rect.fill = opts.missing_fill;
    opts_rect.x = opts.pos[0] + opts_rect.dx;
    opts_rect.y = size.y + size.height + opts.gap + opts_rect.dy + opts.gap;
    let box = missing.append("rect");
    Object.entries(opts_rect).forEach((d) =>
      box.attr(camelcasetodash(d[0]), d[1])
    );

    opts_values.text = opts.missing_text;
    opts_values.dx = 5;
    opts_values.dy = 0;
    opts_values.textAnchor = "start";
    opts_values.pos = [
      opts.pos[0] + opts.rect_width,
      size.y +
        size.height +
        opts.gap +
        opts_rect.dy +
        opts_rect.height / 2 +
        opts.gap,
    ];

    addText(missing, opts_values);
  }

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
