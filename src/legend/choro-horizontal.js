import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { roundarray } from "../helpers/rounding";
import { addattrlegend } from "../helpers/addattrlegend";
import { formatLocale } from "d3-format";
import { descending } from "d3-array";
const d3 = Object.assign({}, { formatLocale, descending });

/**
 * The `choro_horizontal` function allows to create a legend with a color gradient (boxes)
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id of the layer
 * @param {number[]} options.pos - position of the legend
 * @param {number[]} options.breaks - an array of breaks
 * @param {string[]} options.colors - an array of colors
 * @param {boolean} options.missing - to display a box for no data
 * @param {string} options.missing_text - label for no data
 * @param {string} options.missing_fill - color for no data
 * @param {number} options.gap - gap between title and boxes
 * @param {boolean} options.reverse - Reverse values and colors
 * @param {number|string} options.texts_foo - *svg attributes for all texts in the legend (texts_fill, texts_opacity...)*
 * @param {number|string} options.title_foo - *svg attributes for the title of the legend (title_text, title_fontSize, title_textDecoration...)*
 * @param {number|string} options.subtitle_foo - *svg attributes for the subtitle of the legend (subtitle_text, subtitle_fontSize, subtitle_textDecoration...)*
 * @param {number|string} options.note_foo - *svg attributes for the note bellow the legend (note_text, note_fontSize, note_textDecoration...)*
 * @param {number|string} options.values_foo - *svg attributes for the values of the legend (values_fontSize, values_textDecoration...)*
 * @param {number|string} options.rect_foo - *svg attributes for the boxes of the legend (rect_stroke, rect_strokeWidth...)*
 * @param {number} options.rect_width - width of the boxes
 * @param {number} options.rect_height - height of the boxes
 * @param {number} options.rect_gap - gap between boxes
 * @param {number} options.rect_stroke - stroke of the boxes
 * @param {number} options.rect_strokeWidth - stroke-width of the boxes
 * @param {number} options.values_round - rounding of legend values
 * @param {number} options.values_decimal - number of digits
 * @param {string} options.values_thousands - thousands separator
 * @param {number} options.values_dy - to move values up or down
 * @param {number} options.lineLength - length of line connecting circles to values
 * @param {number} options.gap - gap between texts and legend
 * @example
 * let legend = geoviz.legend.choro_horizontal(main, { breaks: [foo]), title_text: "GDP per capita", colors: [foo] })
 * @returns {SVGSVGElement|string} - the function adds a layer with a legend and its id
 */
export function choro_horizontal(
  svg,
  {
    pos = [10, 10],
    id = unique(),
    breaks = [],
    colors = [],
    missing = true,
    missing_fill = "white",
    missing_text = "no data",
    values_round = 2,
    values_decimal = ".",
    values_thousands = " ",
    gap = 10,
    rect_gap = 0,
    rect_width = 45,
    rect_height = 14,
    values_dy = 5,
    reverse = false,
    rect_stroke = "white",
    rect_strokeWidth = 0.3,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();
  layer.attr("transform", `translate(${pos})`);

  // Title
  let dy = legtitle(svg, layer, arguments[1], "title", 0);

  // Subtitle
  dy = legtitle(svg, layer, arguments[1], "subtitle", dy);

  // Vertical boxes layer
  let horizontalchoro = layer.append("g");

  // Rect

  let rect = horizontalchoro
    .append("g")
    .attr("stroke", rect_stroke)
    .attr("stroke-opacity", rect_strokeWidth);

  rect
    .selectAll("rect")
    .data(reverse ? colors.slice().reverse() : colors)
    .join("rect")
    .attr("x", (d, i) => i * (rect_width + rect_gap))
    .attr("y", gap + dy)
    .attr("width", rect_width)
    .attr("height", rect_height)
    .attr("fill", (d) => d);

  if (missing) {
    rect
      .append("rect")
      .attr("x", colors.length * (rect_width + rect_gap) + gap)
      .attr("y", gap + dy)
      .attr("width", rect_width)
      .attr("height", rect_height)
      .attr("fill", missing_fill);
  }

  addattrlegend({
    params: arguments[1],
    layer: rect,
    prefix: "rect",
  });

  // Values
  let locale = d3.formatLocale({
    decimal: values_decimal,
    thousands: values_thousands,
    grouping: [3],
  });

  let values = horizontalchoro
    .append("g")
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("font-family", svg.fontFamily)
    .attr("fill", "#363636");
  values
    .selectAll("text")
    .data(
      reverse
        ? roundarray(breaks.slice().reverse(), values_round)
        : roundarray(breaks, values_round)
    )
    .join("text")
    .attr("x", (d, i) => i * (rect_width + rect_gap) - rect_gap / 2)
    .attr("y", gap + dy + rect_height + values_dy)
    .text((d) => locale.format(",")(d))
    .attr("dominant-baseline", "hanging");

  if (missing) {
    values
      .append("text")
      .attr("x", colors.length * (rect_width + rect_gap) + gap + rect_width / 2)
      .attr("y", gap + dy + rect_height / 2)
      .text(missing_text)
      .attr("dominant-baseline", "central");
  }

  addattrlegend({
    params: arguments[1],
    layer: values,
    prefix: "values",
  });

  // Note
  dy = legtitle(
    svg,
    layer,
    arguments[1],
    "note",
    dy +
      gap +
      rect_height +
      gap +
      (arguments[1].values_fontSize ? arguments[1].values_fontSize : 10)
  );
  return `#${id}`;
}
