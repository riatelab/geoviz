import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { addattrlegend } from "../helpers/addattrlegend";

/**
 * The `typo_vertical` function allows to create a legend with classes (boxes)
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
 * @param {number} options.values_dx - To move values to the right
 * @param {number} options.lineLength - length of line connecting circles to values
 * @param {number} options.gap - Gap between texts and legend
 * @example
 * let legend = legend.typo_vertical(main, { types: [foo]), title_text: "GDP per capita", colors: [foo] })
 * @returns {SVGSVGElement|string} - the function adds a layer with a legend and its id
 */
export function typo_vertical(
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
    rect_gap = 3,
    rect_width = 25,
    rect_height = 17,
    values_dx = 5,
    rect_stroke = "white",
    rect_strokeWidth = 0.3,
    alphabetical = true,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();
  layer.attr("transform", `translate(${pos})`);

  // Title
  let dy = legtitle(layer, arguments[1], "title", 0);

  // Subtitle
  dy = legtitle(layer, arguments[1], "subtitle", dy);

  // Vertical boxes layer
  let verticaltypo = layer.append("g");

  // Sort
  if (alphabetical) {
    let all = types.map((d, i) => [d, colors[i]]).sort();
    types = all.map((d) => d[0]);
    colors = all.map((d) => d[1]);
  }

  // Rect

  let rect = verticaltypo
    .append("g")
    .attr("stroke", rect_stroke)
    .attr("stroke-opacity", rect_strokeWidth);

  rect
    .selectAll("rect")
    .data(colors)
    .join("rect")
    .attr("x", 0)
    .attr(
      "y",
      (d, i) => gap + dy + i * rect_height + rect_gap * i + rect_gap / 2
    )
    .attr("width", rect_width)
    .attr("height", rect_height)
    .attr("fill", (d) => d);

  if (missing) {
    rect
      .append("rect")
      .attr("x", 0)
      .attr(
        "y",
        dy + gap + colors.length * (rect_height + rect_gap) + gap + rect_gap / 2
      )
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

  let values = verticaltypo
    .append("g")
    .attr("dominant-baseline", "middle")
    .attr("font-size", 10)
    .attr("fill", "#363636");
  values
    .selectAll("text")
    .data(types)
    .join("text")
    .attr("x", rect_width + values_dx)
    .attr(
      "y",
      (d, i) =>
        gap +
        dy +
        i * rect_height +
        rect_gap * i +
        rect_gap / 2 +
        rect_height / 2
    )
    .text((d) => d);

  if (missing) {
    values
      .append("text")
      .attr("x", rect_width + values_dx)
      .attr(
        "y",
        dy +
          gap +
          colors.length * (rect_height + rect_gap) +
          gap +
          rect_gap / 2 +
          rect_height / 2
      )
      .text(missing_text);
  }

  addattrlegend({
    params: arguments[1],
    layer: values,
    prefix: "values",
  });

  // Note
  dy = legtitle(
    layer,
    arguments[1],
    "note",
    dy +
      gap +
      colors.length * rect_height +
      colors.length * rect_gap +
      gap +
      (missing ? rect_height + rect_gap + gap : 0)
  );
  return `#${id}`;
}
