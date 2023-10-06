import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { datatoradius } from "../helpers/datatoradius";
import { addattrprefix } from "../helpers/addattrprefix";
import { formatLocale } from "d3-format";
import { sum, cumsum } from "d3-array";
const d3 = Object.assign({}, { formatLocale, sum, cumsum });
/**
 * The `circles` function allows to create a nested proportional circles legend
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
 * @example
 * let legend = geoviz.legend.circles_nested(main, { data: world.features.map((d) => +d.properties.pop), title_text: "Number of inhabitants", k: 70 })
 * @returns {SVGSVGElement|string} - the function adds a layer with a legend and its id
 */
export function circles(
  svg,
  {
    data,
    pos = [10, 10],
    id = unique(),
    k = 50,
    fixmax = null,
    nb = 4,
    lineLength = 10,
    values_round = 2,
    values_decimal = ".",
    values_thousands = " ",
    values_dx = 3,
    gap = 5,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id).attr("pointer-events", "none")
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();
  layer.attr("transform", `translate(${pos})`);

  // Title
  let dy = legtitle(svg, layer, arguments[1], "title", 0);

  // Subtitle
  dy = legtitle(svg, layer, arguments[1], "subtitle", dy);

  // Circles
  let arr = datatoradius(data, { nb, round: values_round, fixmax, k })
    .slice()
    .reverse();
  let rmax = arr[0][1];

  let nestedcircles = layer.append("g");

  // Circles

  let cumdiam = d3.cumsum(arr.map((d) => d[1] * 2));

  let circles = nestedcircles
    .selectAll("circle")
    .data(arr)
    .join("circle")
    .attr("r", (d) => d[1])
    .attr(
      "transform",
      (d, i) => `translate(${rmax}, ${gap + dy - d[1] + cumdiam[i] + i * gap} )`
    )
    .attr("fill", "none")
    .attr("stroke", "#363636");
  addattrprefix({
    params: arguments[1],
    layer: circles,
    prefix: "circles",
  });

  // Lines;
  let lines = nestedcircles
    .selectAll("line")
    .data(arr)
    .join("line")
    .attr("x1", (d) => rmax + d[1])
    .attr("x2", rmax * 2 + lineLength)
    .attr("y1", (d, i) => gap + dy - d[1] + cumdiam[i] + i * gap)
    .attr("y2", (d, i) => gap + dy - d[1] + cumdiam[i] + i * gap)
    .attr("fill", "none")
    .attr("stroke", "#363636")
    .attr("stroke-dasharray", 1)
    .attr("stroke-width", 0.7);
  addattrprefix({
    params: arguments[1],
    layer: lines,
    prefix: "lines",
  });

  //Values;
  let locale = d3.formatLocale({
    decimal: values_decimal,
    thousands: values_thousands,
    grouping: [3],
  });

  let values = nestedcircles
    .selectAll("text")
    .data(arr)
    .join("text")
    .attr("x", rmax * 2 + lineLength + values_dx)
    .attr("y", (d, i) => gap + dy - d[1] + cumdiam[i] + i * gap)
    .text((d) => locale.format(",")(d[0]))
    .attr("dominant-baseline", "middle")
    .attr("font-size", 10)
    .attr("font-family", svg.fontFamily)
    .attr("fill", "#363636");
  addattrprefix({
    params: arguments[1],
    layer: values,
    prefix: "values",
    text: true,
  });

  // Note
  dy = legtitle(
    svg,
    layer,
    arguments[1],
    "note",
    gap + dy + cumdiam[cumdiam.length - 1] + cumdiam.length * gap
  );
  return `#${id}`;
}
