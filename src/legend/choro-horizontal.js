import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash } from "../helpers/camelcase";
import { roundarray } from "../helpers/rounding";
import { getsize } from "../helpers/getsize";
import {
  addTitle,
  addSubtitle,
  addNote,
  subsetobj,
  addText,
  addFrame,
  manageoptions,
} from "../helpers/utils_legend.js";
import { formatLocale } from "d3-format";
const d3 = Object.assign({}, { formatLocale });

/**
 * @description The `choro_horizontal` function allows to add an horizontal legend on a map for choropleth layers
 * @see {@link https://observablehq.com/@neocartocnrs/legends}
 *
 * @param {SVGSVGElement} arg1 - SVG container (optional)
 * @param {object} arg2 - options and parameters
 * @param {"string"} arg2.id - unique id
 * @param {number[]} arg2.pos - legend position (default:[0,0])
 * @param {number} arg2.gap - gap between elements
 
 * @param {number[]} arg2.breaks - breaks (default: [1, 2, 3, 4, 5])
 * @param {string[]} arg2.colors - colors (default: ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"])
 
 * @param {string} arg2.rect_width - width of the box (default: 50)
 * @param {string} arg2.rect_height - height of the box (default: 14)
 * @param {number} arg2.rect_spacing - spacing between boxes
  * @param {*} arg2.rect_foo - *other SVG attributes that can be applied on this rect element (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 
 * @param {string} arg2.values_textAnchor - text-anchor (default: "middle")
 * @param {number} arg2.values_dx - shift in x (default: 0)
 * @param {number} arg2.values_dx - shift in y (default: 5)
 * @param {*} arg2.values_foo - *SVG attributes that can be applied on this text element (fill, fontSize...)*

* @param {string} arg2.title - title of the legend
 * @param {string|number} arg2.title_foo - *SVG attributes that can be applied on this text element*
 * @param {string} arg2.subtitle - subtitle of the legend
 * @param {string|number} arg2.subtitle_foo - *SVG attributes that can be applied on this text element*
 * @param {string} arg2.note - note displayed above the legend
 * @param {string|number} arg2.note_foo - *SVG attributes that can be applied on this text element*
 * @param {boolean} arg2.frame - frame around the legend (default: false)
 * @param {string|number} arg2.frame_foo - *SVG attributes that can be applied on this frame element (rect)*
 * @param {string|number} arg2.text_foo - *SVG attributes that can be applied directly on all text elements of this legend*

* @example
 * geoviz.legend.choro_horizontal(svg, { pos: [10,20], breaks, colors}) // where svg is the container
 * svg.legend.choro_horizontal(svg, {pos: [10,20], breaks, colors} }) // where svg is the container
 * geoviz.legend.choro_horizontal({ pos: [10,20], breaks, colors}) // no container
 *
 * @returns {SVGSVGElement|string} - the function adds a layer with a choro legend to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 */

export function choro_horizontal(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;

  // Arguments
  const options = {
    title: "Legend",
    breaks: [1, 2, 3, 4, 5],
    colors: ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"],
    values_textAnchor: "middle",
    values_dx: 0,
    values_dy: 5,
    rect_width: 50,
    rect_height: 14,
  };
  let opts = manageoptions(options, newcontainer ? arg1 : arg2, svg.fontFamily);

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Title
  addTitle(layer, opts);

  // Subtitle
  addSubtitle(layer, opts);

  // values
  let locale = d3.formatLocale({
    decimal: opts.values_decimal,
    thousands: opts.values_thousands,
    grouping: [3],
  });

  let values = layer.append("g");
  let size = getsize(layer);
  const opts_values = Object.assign(
    subsetobj(opts, { prefix: "values_" }),
    subsetobj(opts, { prefix: "text_" })
  );

  Object.entries(opts_values).forEach((d) =>
    values.attr(camelcasetodash(d[0]), d[1])
  );

  // Boxes
  let rect = layer.append("g");
  let opts_rect = subsetobj(opts, {
    prefix: "rect_",
    exclude: ["fill", "width", "height", "spacing"],
  });
  Object.entries(opts_rect).forEach((d) =>
    rect.attr(camelcasetodash(d[0]), d[1])
  );

  let posy = opts.pos[1] + size.height + opts.gap + opts.rect_dy;
  let posx = opts.pos[0] + opts.rect_dx;

  rect
    .selectAll("rect")
    .data(!opts.reverse ? opts.colors : opts.colors.slice().reverse())
    .join("rect")
    .attr("x", (d, i) => posx + i * (opts.rect_spacing + opts.rect_width))
    .attr("y", posy)
    .attr("width", opts.rect_width)
    .attr("height", opts.rect_height)
    .attr("fill", "red")
    .attr("fill", (d) => d);

  // Values
  size = getsize(layer);
  values
    .selectAll("text")
    .data(
      !opts.reverse
        ? roundarray(opts.breaks, opts.values_round)
        : roundarray(opts.breaks.slice().reverse(), opts.values_round)
    )
    .join("text")
    .attr(
      "x",
      (d, i) =>
        opts.pos[0] + i * (opts.rect_width + opts.rect_spacing) + opts.values_dx
    )
    .attr("y", opts.pos[1] + size.height + opts.gap + opts.values_dy)
    .text((d) => locale.format(",")(d));

  // Missing
  if (opts.missing) {
    let missing = layer.append("g");
    let size = getsize(layer);
    let opts_rect = subsetobj(opts, { prefix: "rect_", exclude: ["dx", "dy"] });
    opts_rect.fill = opts.missing_fill;
    opts_rect.x = opts.pos[0] + opts_rect.dx;
    opts_rect.y = size.y + size.height + opts.gap + opts_rect.dy + opts.gap;
    let box = missing.append("rect");
    Object.entries(opts_rect).forEach((d) =>
      box.attr(camelcasetodash(d[0]), d[1])
    );

    opts_values.text = opts.missing_text;
    opts_values.dx = 5;
    opts_values.dy = 0;
    opts_values.textAnchor = "start";
    opts_values.pos = [
      opts.pos[0] + opts.rect_width,
      size.y +
        size.height +
        opts.gap +
        opts_rect.dy +
        opts_rect.height / 2 +
        opts.gap,
    ];

    addText(missing, opts_values);
  }

  // Note
  addNote(layer, opts);

  // Frame
  if (opts.frame) {
    addFrame(layer, opts);
  }

  // Output;
  if (newcontainer) {
    const size = getsize(layer);
    svg
      .attr("width", size.width)
      .attr("height", size.height)
      .attr("viewBox", [size.x, size.y, size.width, size.height]);
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
