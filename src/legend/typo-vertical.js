import { create } from "../container/create";
import { render } from "../container/render";
import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { addattrprefix } from "../helpers/addattrprefix";
import { addbackground } from "../helpers/addbackground";

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
 * @param {number} options.values_dx - to move values to the right
 * @param {number} options.lineLength - length of line connecting circles to values
 * @param {number} options.gap - gap between texts and legend
 * @param {boolean|object} options.background - use true tu add a background behind the legend. You can set also an object to customize it {  margin, fill, stroke, fillOpacity, strokeWidth}
 * @example
 * let legend = geoviz.legend.typo_vertical(main, { types: [foo]), title_text: "GDP per capita", colors: [foo] })
 * @returns {SVGSVGElement|string} - the function adds a layer with a legend and its id
 */

export function typo_vertical(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;
  let options = newcontainer ? arg1 : arg2;

  // Default values
  let opts = {
    pos: [10, 10],
    id: unique(),
    types: ["A", "B", "C", "D"],
    colors: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"],
    missing: true,
    missing_fill: "white",
    missing_text: "no data",
    title_text: "title_text",
    gap: 5,
    rect_gap: 3,
    rect_width: 25,
    rect_height: 17,
    values_dx: 5,
    rect_stroke: "black",
    rect_strokeWidth: 0.3,
    alphabetical: true,
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

  // Vertical boxes layer
  let verticaltypo = layer.append("g");

  // Sort
  if (opts.alphabetical) {
    let all = opts.types.map((d, i) => [d, opts.colors[i]]).sort();
    opts.types = all.map((d) => d[0]);
    opts.colors = all.map((d) => d[1]);
  }

  // Rect

  let rect = verticaltypo
    .append("g")
    .attr("stroke", opts.rect_stroke)
    .attr("stroke-opacity", opts.rect_strokeWidth);

  rect
    .selectAll("rect")
    .data(opts.colors)
    .join("rect")
    .attr("x", 0)
    .attr(
      "y",
      (d, i) =>
        opts.gap +
        dy +
        i * opts.rect_height +
        opts.rect_gap * i +
        opts.rect_gap / 2
    )
    .attr("width", opts.rect_width)
    .attr("height", opts.rect_height)
    .attr("fill", (d) => d);

  if (opts.missing) {
    rect
      .append("rect")
      .attr("x", 0)
      .attr(
        "y",
        dy +
          opts.gap +
          opts.colors.length * (opts.rect_height + opts.rect_gap) +
          opts.gap +
          opts.rect_gap / 2
      )
      .attr("width", opts.rect_width)
      .attr("height", opts.rect_height)
      .attr("fill", opts.missing_fill);
  }

  addattrprefix({
    params: opts,
    layer: rect,
    prefix: "rect",
  });

  // Values

  let values = verticaltypo
    .append("g")
    .attr("dominant-baseline", "middle")
    .attr("font-size", 10)
    .attr("font-family", svg.fontFamily)
    .attr("fill", "#363636");
  values
    .selectAll("text")
    .data(opts.types)
    .join("text")
    .attr("x", opts.rect_width + opts.values_dx)
    .attr(
      "y",
      (d, i) =>
        opts.gap +
        dy +
        i * opts.rect_height +
        opts.rect_gap * i +
        opts.rect_gap / 2 +
        opts.rect_height / 2
    )
    .text((d) => d);

  if (opts.missing) {
    values
      .append("text")
      .attr("x", opts.rect_width + opts.values_dx)
      .attr(
        "y",
        dy +
          opts.gap +
          opts.colors.length * (opts.rect_height + opts.rect_gap) +
          opts.gap +
          opts.rect_gap / 2 +
          opts.rect_height / 2
      )
      .text(opts.missing_text);
  }

  addattrprefix({
    params: opts,
    layer: values,
    prefix: "values",
  });

  // Note
  dy = legtitle(
    svg,
    layer,
    opts,
    "note",
    dy +
      opts.gap +
      opts.colors.length * opts.rect_height +
      opts.colors.length * opts.rect_gap +
      opts.gap +
      (opts.missing ? opts.rect_height + opts.rect_gap + opts.gap : 0)
  );

  // Background
  if (opts.background) {
    addbackground({ node: layer, ...opts.background });
  }

  // Background
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
