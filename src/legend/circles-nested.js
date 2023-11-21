import { create } from "../container/create";
import { render } from "../container/render";
import { getsize } from "../helpers/getsize";
import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { datatoradius } from "../helpers/datatoradius";
import { addattrprefix } from "../helpers/addattrprefix";
import { formatLocale } from "d3-format";
import { addbackground } from "../helpers/addbackground";

const d3 = Object.assign({}, { formatLocale });
/**
 * The `circles_nested` function allows to create a nested proportional circles legend
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.data - an array of numerical values.
 * @param {string} options.id - id of the layer
 * @param {number[]} options.pos - position of the legend
 * @param {number} options.k - dadius of the largest circle (or corresponding to the value defined by `fixmax`)
 * @param {number} options.fixmax - value matching the circle with radius `k`. Setting this value is useful for making maps comparable with each other
 * @param {number} options.nb - lumber of circles in legend
 * @param {number|string} options.texts_foo - *svg attributes for all texts in the legend (texts_fill, texts_opacity...)*
 * @param {number|string} options.title_foo - *svg attributes for the title of the legend (title_text, title_fontSize, title_textDecoration...)*
 * @param {number|string} options.subtitle_foo - *svg attributes for the subtitle of the legend (subtitle_text, subtitle_fontSize, subtitle_textDecoration...)*
 * @param {number|string} options.note_foo - *svg attributes for the note bellow the legend (note_text, note_fontSize, note_textDecoration...)*
 * @param {number|string} options.values_foo - *svg attributes for the values of the legend (values_fontSize, values_textDecoration...)*
 * @param {number} options.values_round - rounding of legend values
 * @param {number} options.values_decimal - number of digits
 * @param {string} options.values_thousands - thousands separator
 * @param {number} options.lineLength - length of line connecting circles to values
 * @param {number} options.gap - Gap between texts and legend
 * @param {boolean|object} options.background - use true tu add a background behind the legend. You can set also an object to customize it {  margin, fill, stroke, fillOpacity, strokeWidth}
 * @example
 * let legend = geoviz.legend.circles_nested(main, { data: world.features.map((d) => +d.properties.pop), title_text: "Number of inhabitants", k: 70 })
 * @returns {SVGSVGElement|string} - the function adds a layer with a legend and its id
 */

export function circles_nested(arg1, arg2) {
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
    pos: [0, 0],
    id: unique(),
    k: 50,
    fixmax: null,
    nb: 4,
    title_text: "title_text",
    lineLength: 10,
    values_round: 2,
    values_decimal: ".",
    values_thousands: " ",
    values_dx: 3,
    gap: 7,
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

  // Circles
  let arr = datatoradius(opts.data, {
    nb: opts.nb,
    round: opts.values_round,
    fixmax: opts.fixmax,
    k: opts.k,
  });
  let rmax = arr[arr.length - 1][1];

  let nestedcircles = layer.append("g");

  // Circles
  let circles = nestedcircles
    .selectAll("circle")
    .data(arr.reverse())
    .join("circle")
    .attr("r", (d) => d[1])
    .attr(
      "transform",
      (d) => `translate(${rmax}, ${opts.gap + dy + rmax * 2 - d[1]})`
    )
    .attr("fill", "none")
    .attr("stroke", "#363636");
  addattrprefix({
    params: opts,
    layer: circles,
    prefix: "circles",
  });

  // Lines
  let lines = nestedcircles
    .selectAll("line")
    .data(arr)
    .join("line")
    .attr("x1", rmax)
    .attr("x2", rmax + rmax + opts.lineLength)
    .attr("y1", (d) => opts.gap + dy + rmax * 2 - d[1] * 2)
    .attr("y2", (d) => opts.gap + dy + rmax * 2 - d[1] * 2)
    .attr("fill", "none")
    .attr("stroke", "#363636")
    .attr("stroke-dasharray", 2)
    .attr("stroke-width", 0.7);
  addattrprefix({
    params: opts,
    layer: lines,
    prefix: "lines",
  });

  // Values
  let locale = d3.formatLocale({
    decimal: opts.values_decimal,
    thousands: opts.values_thousands,
    grouping: [3],
  });

  let values = nestedcircles
    .selectAll("text")
    .data(arr)
    .join("text")
    .attr("x", rmax + rmax + opts.lineLength + opts.values_dx)
    .attr("y", (d) => opts.gap + dy + rmax * 2 - d[1] * 2)
    .text((d) => locale.format(",")(d[0]))
    .attr("dominant-baseline", "middle")
    .attr("font-size", 10)
    .attr("font-family", svg.fontFamily)
    .attr("fill", "#363636");
  addattrprefix({
    params: opts,
    layer: values,
    prefix: "values",
    text: true,
  });

  // Note
  dy = legtitle(svg, layer, opts, "note", dy + rmax * 2 + opts.gap * 2);

  // Background
  if (opts.background) {
    addbackground({ node: layer, ...opts.background });
  }
  // Output
  if (newcontainer) {
    const newheight = getsize(layer).height + opts.pos[1];
    svg
      .attr("width", svg.width)
      .attr("height", newheight)
      .attr("viewBox", [0, 0, svg.width, newheight]);
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
