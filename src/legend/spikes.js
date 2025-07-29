import { create } from "../container/create.js";
import { render } from "../container/render.js";
import { camelcasetodash } from "../helpers/camelcase.js";
import { datatoheight } from "../helpers/datatoheight.js";
import { getsize } from "../helpers/getsize.js";
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

/**
 * @function legend/spikes
 * @description The `legend.spikes` function allows to add an legend for spike marks. The function adds a legend layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/legends}
 * @property {string} [id] - unique id
 * @property {number[]} [pos = [0,0]] - legend position
 * @property {number} [gap = 2] - gap between elements
 * @property {number[]} [data = [1, 1000]] - input values
 * @property {number} [k = 50] - height of the highest spike (or corresponding to the value defined by fixmax ) (default: 100)
 * @property {string[]} [fixmax = null] - value matching the spike with height k . Setting this value is useful for making maps comparable with each other
 * @property {number} [nb = 4] - number of spikes
 * @property {number} [spike_width = 30] - a number defining the width of the spikes
 * @property {number} [spike_straight = 0] - a number between 0 and 1 defining the curve of the spikes. 0 = curved ; 1 = straight
 * @property {number} [spike_spacing = 3] - spacing between spikes (default: 3)
 * @property {string} [spike_fill = "none"] - fill color for the cspikesrcles
 * @property {string} [spike_stroke = "black"] - stroke color for the spikes
 * @property {*} [spike_*] - *SVG attributes that can be applied on this spike element*
 * @property {string} values_textAnchor - text-anchor (default: "middle")
 * @property {number} values_dx - shift in x (default: 0)
 * @property {number} values_dx - shift in y (default: 5)
 * @property {number} [values_fill = "#363636"] - fill
 * @property {number} [values_fontSize = 10] - fontSize
 * @property {number} [values_factor = 1] - allow to multiply values to display in the legend. e.g 0.001 to convert into thousands
 * @property {string} [values_decimal = "."] - separator for decimals
 * @property {string} [values_thousands = " "] -  separator for thousands
 * @property {string} [title = "Legend"] - title of the legend
 * @property {string} [title_fill = "#363636"] - title color
 * @property {string} [title_fontSize = 16] - title font size
 * @property {*} [title_*] - *SVG attributes that can be applied on this text element*
 * @property {string} [subtitle] - subtitle of the legend
 * @property {string} [subtitle_fill = "#363636"] - subtitle color
 * @property {string} [subtitle_fontSize = 12] - subtitle font size
 * @property {*} [subtitle_*] - *SVG attributes that can be applied on this text element*
 * @property {string} [note] - note displayed above the legend
 * @property {string} [note_fill = "#363636"] - note color
 * @property {string} [note_fontSize = 1O] - note font size
 * @property {*} [note_*] - *SVG attributes that can be applied on this text element*
 * @property {boolean} [frame = false] - frame around the legend
 * @property {boolean} [frame_margin = 15] - frame margin
 * @property {boolean} [frame_fill = "white"] - frame fill
 * @property {boolean} [frame_stroke = "black"] - frame fill
 * @property {boolean} [frame_fillOpacity = 0.5] - frame fill-opacity
 * @property {*} [frame_*] - *SVG attributes that can be applied on this frame element (rect)*
 * @property {*} [text_*] - *SVG attributes that can be applied directly on all text elements of this legend*
 * @example
 * // There are several ways to use this function
 * geoviz.legend.spikes(svg, { pos: [10,20], data, nb:5}) // where svg is the container
 * svg.legend.spikes({pos: [10,20], data, nb: 5} }) // where svg is the container
 * svg.plot({type: "spikes", pos: [10,20], data, nb: 5} }) // where svg is the container
 * geoviz.legend.spikes({ pos: [10,20], data, nb: 5}) // no container
 */

export function spikes(arg1, arg2) {
  // Test if new container
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;
  // Arguments

  const options = {
    data: [1, 1000],
    k: 50,
    fixmax: null,
    nb: 4,
    spike_width: 30,
    spike_straight: 0,
    values_dx: 0,
    values_dy: 0,
    values_dominantBaseline: "middle",
  };
  let opts = manageoptions(options, newcontainer ? arg1 : arg2, svg.fontFamily);

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg
        .append("g")
        .attr("id", opts.id)
        .attr("class", "geovizlegend")
        .attr("data-layer", "legend")
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
    factor: opts.values_factor,
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
      (d) => `m ${0 - opts.spike_width / 2},${0} Q 0,${
        0 - d[1] * opts.spike_straight
      },0 ${0 - d[1]}
   Q 0, ${0 - d[1] * opts.spike_straight} ${0 + opts.spike_width / 2},0`
    )
    .attr(
      "transform",
      (d, i) =>
        `translate(${
          opts.spike_width / 2 +
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
