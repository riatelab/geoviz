import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash } from "../helpers/camelcase";
import { datatoheight } from "../helpers/datatoheight";
import { getsize } from "../helpers/getsize";
import {
  addTitle,
  addSubtitle,
  addNote,
  subsetobj,
  manageoptions,
  addFrame,
} from "../helpers/utils_legend.js";
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

  const options = {
    data: [1, 1000],
    k: 50,
    fixmax: null,
    nb: 4,
    values_dx: 0,
    values_dy: 0,
    values_dominantBaseline: "middle",
  };
  let opts = manageoptions(options, newcontainer ? arg1 : arg2, svg.fontFamily);

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
      (d) => `M 0,0 ${opts.spike_width / 2},${-d[1]} ${opts.spike_width},0`
    )
    .attr(
      "transform",
      (d, i) =>
        `translate(${
          opts.pos[0] +
          opts.spike_dx +
          +opts.spike_width * i +
          i * opts.spike_spacing
        },${opts.pos[1] + size.height + opts.spike_dy + hmax + opts.gap})`
    );

  let opts_spikes = subsetobj(opts, {
    prefix: "spike_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_spikes).forEach((d) =>
    spikes.attr(camelcasetodash(d[0]), d[1])
  );

  // Values
  size = getsize(layer);
  let locale = d3.formatLocale({
    decimal: opts.values_decimal,
    thousands: opts.values_thousands,
    grouping: [3],
  });

  let values = leg
    .selectAll("text")
    .data(arr)
    .join("text")
    .text((d) => locale.format(",")(d[0]))
    .attr(
      "transform",
      (d, i) =>
        `translate (${
          opts.pos[0] +
          opts.spike_dx +
          opts.spike_width / 2 +
          opts.spike_width * i +
          i * opts.spike_spacing
        } ${opts.pos[1] + size.height + opts.spike_dy}) rotate(90)`
    );
  let opts_values = subsetobj(opts, {
    prefix: "values_",
  });
  Object.entries(opts_values).forEach((d) =>
    values.attr(camelcasetodash(d[0]), d[1])
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
