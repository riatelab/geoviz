import { create } from "../container/create";
import { render } from "../container/render";
import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { datatoheight } from "../helpers/datatoheight";
import { addattrprefix } from "../helpers/addattrprefix";
import { addbackground } from "../helpers/addbackground";
import { formatLocale } from "d3-format";
import { sum, cumsum } from "d3-array";
const d3 = Object.assign({}, { formatLocale, sum, cumsum });

/**
 * The `spikes` function allows to create a legend for spike layers
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.data - an array of numerical values.
 * @param {string} options.id - id of the layer
 * @param {number[]} options.pos - position of the legend
 * @param {number} options.k - height of the highest spike (or corresponding to the value defined by `fixmax`)
 * @param {number} options.fixmax - value matching the spikes with height `k`. Setting this value is useful for making maps comparable with each other
 * @param {number} options.nb - number of spikes in the legend
 * @param {number} options.spikes_width - width of the spikes
 * @param {number|string} options.texts_foo - *svg attributes for all texts in the legend (texts_fill, texts_opacity...)*
 * @param {number|string} options.title_foo - *svg attributes for the title of the legend (title_text, title_fontSize, title_textDecoration...)*
 * @param {number|string} options.subtitle_foo - *svg attributes for the subtitle of the legend (subtitle_text, subtitle_fontSize, subtitle_textDecoration...)*
 * @param {number|string} options.note_foo - *svg attributes for the note bellow the legend (note_text, note_fontSize, note_textDecoration...)*
 * @param {number|string} options.values_foo - *svg attributes for the values of the legend (values_fontSize, values_textDecoration...)*
 * @param {number} options.values_round - rounding of legend values
 * @param {number} options.values_decimal - number of digits
 * @param {string} options.values_thousands - thousands separator
 * @param {number} options.gap - Gap between texts and legend
 * @param {boolean|object} options.background - use true tu add a background behind the legend. You can set also an object to customize it {  margin, fill, stroke, fillOpacity, strokeWidth}
 * @example
 * let legend = geoviz.legend.spikes(main, { data: world.features.map((d) => +d.properties.pop), title_text: "Number of inhabitants", k: 70 })
 * @returns {SVGSVGElement|string} - the function adds a layer with a legend and its id
 */

export function spikes(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;
  let options = newcontainer ? arg1 : arg2;

  // Default values
  let opts = {
    data: [1, 1000],
    pos: [10, 10],
    id: unique(),
    k: 50,
    fixmax: null,
    title_text: "title_text",
    spikes_width: 10,
    nb: 4,
    values_round: 2,
    values_decimal: ".",
    values_thousands: " ",
    gap: 5,
    background: false,
  };

  Object.keys(opts).forEach((d) => {
    if (options[d] !== undefined) {
      opts[d] = options[d];
    }
  });

  Object.keys(options).forEach((d) => {
    opts[d] = options[d];
  });

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id).attr("pointer-events", "none")
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();
  layer.attr("transform", `translate(${opts.pos})`);

  // Title
  let dy = legtitle(svg, layer, opts, "title", 0);

  // Subtitle
  dy = legtitle(svg, layer, opts, "subtitle", dy);

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

  // Spikes

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
        `translate(${opts.spikes_width * i + i * opts.gap},${dy + hmax + 5})`
    )
    .attr("fill", "none")
    .attr("stroke", "black");

  addattrprefix({
    params: opts,
    layer: spikes,
    prefix: "spikes",
  });

  //Values;
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
    .attr("dominant-baseline", "central")
    .attr("font-size", 10)
    .attr("font-family", svg.fontFamily)
    .attr("fill", "#363636")
    .attr(
      "transform",
      (d, i) =>
        `translate (${
          opts.spikes_width * i + i * opts.gap + opts.spikes_width / 2
        } ${dy + hmax + 10}) rotate(90)`
    );
  addattrprefix({
    params: opts,
    layer: values,
    prefix: "values",
    text: true,
  });

  //Background;
  if (opts.background) {
    addbackground({ node: layer, ...opts.background });
  }
  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
