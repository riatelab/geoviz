import { create } from "../container/create";
import { render } from "../container/render";
import { getsize } from "../helpers/getsize";
import { unique } from "../helpers/unique";
import { legtitle } from "../helpers/legtitle";
import { addattrprefix } from "../helpers/addattrprefix";
import { addbackground } from "../helpers/addbackground";

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
 * @param {boolean|object} options.background - use true tu add a background behind the legend. You can set also an object to customize it {  margin, fill, stroke, fillOpacity, strokeWidth}
 * @example
 * let legend = geoviz.legend.box(main, { rect_fill:"blue", values_text:"water" })
 * @returns {SVGSVGElement|string} - the function adds a layer with a legend and its id
 */

export function box(arg1, arg2) {
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
    gap: 5,
    rect_width: 25,
    rect_height: 17,
    values_dx: 5,
    values_dy: 0,
    rect_fill: "#CCC",
    rect_stroke: "black",
    rect_strokeWidth: 0.3,
    values_text: "values_text",
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
  let box = layer.append("g");

  // Rect

  let rect = box
    .append("g")
    .attr("stroke", opts.rect_stroke)
    .attr("stroke-opacity", opts.rect_strokeWidth);

  rect
    .append("rect")
    .attr("x", 0)
    .attr("y", dy + opts.gap)
    .attr("width", opts.rect_width)
    .attr("height", opts.rect_height);

  addattrprefix({
    params: opts,
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
    .attr("x", opts.values_dx + opts.rect_width)
    .attr("y", opts.gap + dy + opts.rect_height / 2 + opts.values_dy)
    .text(opts.values_text);

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
    dy + opts.gap + opts.rect_height + opts.gap
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
