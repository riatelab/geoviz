import { create } from "../container/create";
import { render } from "../container/render";
import { getsize } from "../helpers/getsize";
import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { roundarray } from "../helpers/rounding";
import { addattrprefix } from "../helpers/addattrprefix";
import { addbackground } from "../helpers/addbackground";
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
 * @param {boolean|object} options.background - use true tu add a background behind the legend. You can set also an object to customize it {  margin, fill, stroke, fillOpacity, strokeWidth}
 * @example
 * let legend = geoviz.legend.choro_horizontal(main, { breaks: [foo]), title_text: "GDP per capita", colors: [foo] })
 * @returns {SVGSVGElement|string} - the function adds a layer with a legend and its id
 */

export function choro_horizontal(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;
  let options = newcontainer ? arg1 : arg2;

  // Default values
  let opts = {
    pos: [0, 0],
    id: unique(),
    breaks: [1, 2, 3, 4, 5],
    colors: ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"],
    missing: true,
    missing_fill: "white",
    missing_text: "no data",
    values_round: 2,
    values_decimal: ".",
    values_thousands: " ",
    gap: 10,
    rect_gap: 0,
    rect_width: 45,
    rect_height: 14,
    rect_stroke: "black",
    values_dy: 5,
    title_text: "title_text",
    reverse: false,
    rect_strokeWidth: 0.3,
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
  let horizontalchoro = layer.append("g");

  // Rect

  let rect = horizontalchoro
    .append("g")
    .attr("stroke", opts.rect_stroke)
    .attr("stroke-opacity", opts.rect_strokeWidth);

  rect
    .selectAll("rect")
    .data(opts.reverse ? opts.colors.slice().reverse() : opts.colors)
    .join("rect")
    .attr("x", (d, i) => i * (opts.rect_width + opts.rect_gap))
    .attr("y", opts.gap + dy)
    .attr("width", opts.rect_width)
    .attr("height", opts.rect_height)
    .attr("fill", (d) => d);

  if (opts.missing) {
    rect
      .append("rect")
      .attr(
        "x",
        opts.colors.length * (opts.rect_width + opts.rect_gap) + opts.gap
      )
      .attr("y", opts.gap + dy)
      .attr("width", opts.rect_width)
      .attr("height", opts.rect_height)
      .attr("fill", opts.missing_fill);
  }

  addattrprefix({
    params: options,
    layer: rect,
    prefix: "rect",
  });

  // Values
  let locale = d3.formatLocale({
    decimal: opts.values_decimal,
    thousands: opts.values_thousands,
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
      opts.reverse
        ? roundarray(opts.breaks.slice().reverse(), opts.values_round)
        : roundarray(opts.breaks, opts.values_round)
    )
    .join("text")
    .attr(
      "x",
      (d, i) => i * (opts.rect_width + opts.rect_gap) - opts.rect_gap / 2
    )
    .attr("y", opts.gap + dy + opts.rect_height + opts.values_dy)
    .text((d) => locale.format(",")(d))
    .attr("dominant-baseline", "hanging");

  if (opts.missing) {
    values
      .append("text")
      .attr(
        "x",
        opts.colors.length * (opts.rect_width + opts.rect_gap) +
          opts.gap +
          opts.rect_width / 2
      )
      .attr("y", opts.gap + dy + opts.rect_height / 2)
      .text(opts.missing_text)
      .attr("dominant-baseline", "central");
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
      opts.rect_height +
      opts.gap +
      (opts.values_fontSize ? opts.values_fontSize : 10)
  );

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
