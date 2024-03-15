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
 * @function legend/choro_horizontal
 * @description The `legend.choro_horizontal` function allows to add an horizontal legend on a map for choropleth layers. The function adds a lagend layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/legends}
 * @property {string} [id] - unique id
 * @property {number[]} [pos = [0,0]] - legend position
 * @property {number} [gap = 2] - gap between elements
 * @property {number[]} [breaks = [1, 2, 3, 4, 5]] - breaks
 * @property {string[]} [colors = ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"]] - colors
 * @property {string} [rect_width = 50] - width of the box
 * @property {string} [rect_height = 14] - height of the box
 * @property {number} [rect_spacing = 0] - spacing between boxes
 * @property {string} [rect_fill = "#5d6266"] - box color
 * @property {string} [rect_stroke = "#303030"] - stroke color
 * @property {string} [rect_strokeWidth = 0.1] - stroke width
 * @property {*} [rect_*] - *other SVG attributes that can be applied on this rect element (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @property {string} [values_textAnchor = "middle"] - text-anchor
 * @property {number} [values_dx = 0] - shift in x
 * @property {number} [values_dx = 5] - shift in y
 * @property {string} [values_fontSize =  10] - text size
 * @property {number} [values_fill = "#363636"] - fill
 * @property {number} [values_fontSize = 1°] - fontSize
 * @property {number} [values_factor = 1] - allow to multiply values to display in the legend. e.g 0.001 to convert into thousands
 * @property {string} [values_decimal = "."] - separator for decimals
 * @property {string} [values_thousands = " "] -  separator for thousands
 * @property {string} [title = "Legend"] - title of the legend
 * @property {string} [title_fill = "#363636"] - title color
 * @property {string} [title_fontSize = 16] - title font size
 * @property {*} [title_*] - *SVG attributes that can be applied on this text element*
 * @property {string} [subtitle] - subtitle of the legend
 * @property {string} [subtitle_fill = "#363636"] - subtitle color
 * @property {string} [subtitle_fontSize = 12] - subtitle font size
 * @property {*} [subtitle_*] - *SVG attributes that can be applied on this text element*
 * @property {string} [note] - note displayed above the legend
 * @property {string} [note_fill = "#363636"] - note color
 * @property {string} [note_fontSize = 1O] - note font size
 * @property {*} [note_*] - *SVG attributes that can be applied on this text element*
 * @property {boolean} [frame = false] - frame around the legend
 * @property {boolean} [frame_margin = 15] - frame margin
 * @property {boolean} [frame_fill = "white"] - frame fill
 * @property {boolean} [frame_stroke = "black"] - frame fill
 * @property {boolean} [frame_fillOpacity = 0.5] - frame fill-opacity
 * @property {*} [frame_*] - *SVG attributes that can be applied on this frame element (rect)*
 * @property {*} [text_*] - *SVG attributes that can be applied directly on all text elements of this legend*
 * @example
 * // There are several ways to use this function
 * geoviz.legend.choro_horizontal(svg, { pos: [10,20], breaks, colors}) // where svg is the container
 * svg.legend.choro_horizontal({pos: [10,20], breaks, colors} }) // where svg is the container
 * svg.plot({type: "leg_choro_horizontal", pos: [10,20], breaks, colors} }) // where svg is the container
 * geoviz.legend.choro_horizontal({ pos: [10,20], breaks, colors}) // no container
 */

export function choro_horizontal(arg1, arg2) {
  // Test if new container
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
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

  // factor
  opts.breaks = opts.breaks.map((d) => d * (opts.values_factor || 1));

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
