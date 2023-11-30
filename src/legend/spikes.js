import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash } from "../helpers/camelcase";
import { datatoheight } from "../helpers/datatoheight";
import { mergeoptions } from "../helpers/mergeoptions";
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
import { sum, cumsum } from "d3-array";
const d3 = Object.assign({}, { formatLocale, sum, cumsum });

export function spikes(arg1, arg2) {
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
      data: [1, 1000],
      k: 50,
      fixmax: null,
      nb: 4,
      spikes_width: 10,
      spikes_dx: 0,
      spikes_dy: 0,
      spikes_spacing: 3,
      spikes_fill: "none",
      spikes_stroke: "black",
      missing: true,
      missing_fill: "white",
      missing_text: "no data",
      values_round: 2,
      values_decimal: ".",
      values_thousands: " ",
      values_dx: 2,
      values_dy: 0,
      title_fill: "#363636",
      subtitle_fill: "#363636",
      note_fill: "#363636",
      values_fill: "#363636",
      values_fontSize: 10,
      values_dominantBaseline: "central",
      title_fontSize: 16,
      title_fontWeight: "bold",
      subtitle_fontSize: 12,
      note_fontSize: 10,
      note_fontStyle: "italic",
      gap: 2,
      missing: true,
      missing_fill: "white",
      missing_text: "no data",
      line_fill: "none",
      line_stroke: "#363636",
      line_strokeDasharray: 2,
      line_strokeWidth: 0.7,
      line_length: 10,
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

  // Spikes
  let arr = datatoheight(opts.data, {
    nb: opts.nb,
    round: opts.values_round,
    fixmax: opts.fixmax,
    k: opts.k,
  })
    .slice()
    .reverse();
  let hmax = arr[0][1];
  let leg = layer.append("g");

  let size = getsize(layer);
  let spikes = leg
    .selectAll("path")
    .data(arr)
    .join("path")
    .attr(
      "d",
      (d) => `M 0,0 ${opts.spikes_width / 2},${-d[1]} ${opts.spikes_width},0`
    )
    .attr(
      "transform",
      (d, i) =>
        `translate(${
          opts.pos[0] +
          opts.spikes_dx +
          +opts.spikes_width * i +
          i * opts.spikes_spacing
        },${opts.pos[1] + size.height + +opts.spikes_dy + hmax + opts.gap})`
    );

  let opts_spikes = subsetobj(opts, {
    prefix: "spikes_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_spikes).forEach((d) =>
    spikes.attr(camelcasetodash(d[0]), d[1])
  );

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
