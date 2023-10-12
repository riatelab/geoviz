import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { addattrprefix } from "../helpers/addattrprefix";
import { addbackground } from "../helpers/addbackground";

/**
 * The `typo_horizontal` function allows to create a legend with classes (boxes)
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id of the layer
 * @param {number[]} options.pos - position of the legend
 * @param {string[]} options.types - an array of types
 * @param {string[]} options.colors - an array of colors
 * @param {boolean} options.missing - to display a box for no data
 * @param {string} options.missing_text - label for no data
 * @param {string} options.missing_fill - color for no data
 * @param {number} options.gap - gap between title and boxes
 * @param {boolean} options.alphabetical - Sort by alphabetical order
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
 * @param {boolean|object} options.background - use true tu add a background behind the legend. You can set also an object to customize it {  margin, fill, stroke, fillOpacity, strokeWidth}
 * @example
 * let legend = geoviz.legend.typo_horizontal(main, { types: [foo]), title_text: "GDP per capita", colors: [foo] })
 * @returns {SVGSVGElement|string} - the function adds a layer with a legend and its id
 */
export function typo_horizontal(
  svg,
  {
    pos = [10, 10],
    id = unique(),
    types = [],
    colors = [],
    missing = true,
    missing_fill = "white",
    missing_text = "no data",
    gap = 5,
    rect_gap = 5,
    rect_width = 25,
    rect_height = 17,
    values_dy = 5,
    rect_stroke = "white",
    rect_strokeWidth = 0.3,
    alphabetical = true,
    background = false,
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

  // Vertical boxes layer
  let horizontaltypo = layer.append("g");

  // Sort
  if (alphabetical) {
    let all = types.map((d, i) => [d, colors[i]]).sort();
    types = all.map((d) => d[0]);
    colors = all.map((d) => d[1]);
  }

  // Rect

  let rect = horizontaltypo
    .append("g")
    .attr("stroke", rect_stroke)
    .attr("stroke-opacity", rect_strokeWidth);

  rect
    .selectAll("rect")
    .data(colors)
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

  addattrprefix({
    params: arguments[1],
    layer: rect,
    prefix: "rect",
  });

  // Values

  let values = horizontaltypo
    .append("g")
    .attr("dominant-baseline", "middle")
    .attr("font-size", 10)
    .attr("font-family", svg.fontFamily)
    .attr("fill", "#363636");
  values
    .selectAll("text")
    .data(types)
    .join("text")
    .attr("x", (d, i) => i * (rect_width + rect_gap) + rect_width / 2)
    .attr("y", gap + dy + rect_height + values_dy)
    .text((d) => d)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging");

  if (missing) {
    values
      .append("text")
      .attr("x", colors.length * (rect_width + rect_gap) + gap + rect_width / 2)
      .attr("y", gap + dy + rect_height + values_dy)
      .text(missing_text)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "hanging");
  }

  addattrprefix({
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

  // Background
  if (background) {
    addbackground({ node: layer, ...background });
  }

  return `#${id}`;
}
