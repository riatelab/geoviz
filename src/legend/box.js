import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { addattrprefix } from "../helpers/addattrprefix";

/**
 * The `choro_vertical` function allows to create a legend with a color gradient (boxes)
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id of the layer
 * @param {number[]} options.pos - position of the legend
 * @param {number} options.gap - gap between title and boxes
 * @param {number|string} options.texts_foo - *svg attributes for all texts in the legend (texts_fill, texts_opacity...)*
 * @param {number|string} options.title_foo - *svg attributes for the title of the legend (title_text, title_fontSize, title_textDecoration...)*
 * @param {number|string} options.subtitle_foo - *svg attributes for the subtitle of the legend (subtitle_text, subtitle_fontSize, subtitle_textDecoration...)*
 * @param {number|string} options.note_foo - *svg attributes for the note bellow the legend (note_text, note_fontSize, note_textDecoration...)*
 * @param {number|string} options.values_foo - *svg attributes for the values of the legend (values_fontSize, values_textDecoration...)*
 * @param {number|string} options.rect_foo - *svg attributes for the boxes of the legend (rect_stroke, rect_strokeWidth...)*
 * @param {number} options.rect_width - width of the boxes
 * @param {number} options.rect_height - height of the boxes
 * @param {number} options.rect_stroke - stroke of the boxes
 * @param {number} options.rect_strokeWidth - stroke-width of the boxes
 * @param {number} options.values_dx - to move the label to the right
 * @param {number} options.values_dy - to move the label up or down
 * @param {number} options.lineLength - length of line connecting circles to values
 * @param {number} options.values_text - Text to display
 * @example
 * let legend = geoviz.legend.box(main, { rect_fill:"blue", values_text:"water" })
 * @returns {SVGSVGElement|string} - the function adds a layer with a legend and its id
 */
export function box(
  svg,
  {
    pos = [10, 10],
    id = unique(),
    gap = 5,
    rect_width = 25,
    rect_height = 17,
    values_dx = 5,
    values_dy = 0,
    rect_stroke = "white",
    rect_strokeWidth = 0.3,
    values_text = "values_text",
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
  let box = layer.append("g");

  // Rect

  let rect = box
    .append("g")
    .attr("stroke", rect_stroke)
    .attr("stroke-opacity", rect_strokeWidth);

  rect
    .append("rect")
    .attr("x", 0)
    .attr("y", dy + gap)
    .attr("width", rect_width)
    .attr("height", rect_height);

  addattrprefix({
    params: arguments[1],
    layer: rect,
    prefix: "rect",
  });

  let values = box
    .append("g")
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "middle")
    .attr("font-size", 10)
    .attr("font-family", svg.fontFamily)
    .attr("fill", "#363636");
  values
    .append("text")
    .attr("x", values_dx + rect_width)
    .attr("y", gap + dy + rect_height / 2 + values_dy)
    .text(values_text);

  addattrprefix({
    params: arguments[1],
    layer: values,
    prefix: "values",
  });

  // Note
  dy = legtitle(svg, layer, arguments[1], "note", dy + gap + rect_height + gap);
  return `#${id}`;
}
