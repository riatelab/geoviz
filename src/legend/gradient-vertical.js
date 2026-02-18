/**
 * @function legend/gradient_vertical
 * @description The `legend.gradient_vertical` function adds a vertical gradient legend to an SVG container. It draws a series of colored rectangles with three labels aligned at top, middle, and bottom. Returns the legend layer or renders directly if no container is provided.
 * @see {@link https://observablehq.com/@neocartocnrs/legends}
 *
 * @property {string} [id] - unique id for the legend
 * @property {number[]} [pos = [0,0]] - position of the legend in SVG
 * @property {number} [gap = 5] - gap between title/subtitle and rectangles
 * @property {string[]} [colors = ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"]] - colors of the gradient
 * @property {number} [rect_width = 8] - rectangle width
 * @property {number} [rect_height = 25] - rectangle height
 * @property {number} [rect_spacing = 0] - spacing between rectangles
 * @property {string} [rect_stroke = "white"] - stroke color of rectangles
 * @property {number} [values_fontSize = 12] - font size of labels
 * @property {string} [values_fill = "black"] - fill color of labels
 * @property {string} [text_high = "High"] - label at top
 * @property {string} [text_intermediate = "Intermediate"] - label at middle
 * @property {string} [text_low = "Low"] - label at bottom
 * @property {boolean} [reverse = false] - reverse the order of colors
 * @property {boolean} [frame = false] - whether to draw a frame around legend
 * @example
 * geoviz.legend.gradient_vertical(svg, { pos: [10,20], colors, text_high:"Strong", text_low:"Weak" });
 * geoviz.legend.gradient_vertical({ pos: [10,20], colors, text_high:"High", text_low:"Low" }); // no container
 */
import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash } from "../helpers/camelcase";
import { getsize } from "../helpers/getsize";
import {
  addTitle,
  addSubtitle,
  addNote,
  subsetobj,
  addFrame,
  manageoptions,
} from "../helpers/utils_legend.js";
import { formatLocale } from "d3-format";

const d3 = Object.assign({}, { formatLocale });

export function gradient_vertical(arg1, arg2) {
  // Determine if we need to create a new SVG container
  const newcontainer =
    (arguments.length <= 1 || arg2 === undefined) && !arg1?._groups;

  arg1 = newcontainer && arg1 === undefined ? {} : arg1;
  arg2 = arg2 === undefined ? {} : arg2;
  const svg = newcontainer ? create() : arg1;

  // Default options
  const options = {
    colors: ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"],
    rect_height: 25,
    rect_width: 8,
    rect_stroke: "white",
    rect_spacing: 0,
    rect_dx: 0,
    rect_dy: 0,
    pos: [0, 0],
    gap: 5,
    values_fontSize: 12,
    values_fill: "black",
    reverse: false,
    frame: false,
    text_high: "High",
    text_intermediate: "Intermediate",
    text_low: "Low",
  };

  // Merge user options
  const opts = manageoptions(
    options,
    newcontainer ? arg1 : arg2,
    svg.fontFamily,
  );

  // Initialize legend layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg
        .append("g")
        .attr("id", opts.id)
        .attr("class", "geovizlegend")
        .attr("data-layer", "legend")
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Add title and subtitle
  addTitle(layer, opts);
  addSubtitle(layer, opts);

  // Compute size and positions
  const size = getsize(layer);
  const posx = opts.pos[0] + opts.rect_dx;
  const posy = opts.pos[1] + size.height + opts.gap + opts.rect_dy;

  // Draw rectangle group
  const rectGroup = layer.append("g");
  const opts_rect = subsetobj(opts, {
    prefix: "rect_",
    exclude: ["fill", "width", "height", "spacing"],
  });
  Object.entries(opts_rect).forEach((d) =>
    rectGroup.attr(camelcasetodash(d[0]), d[1]),
  );

  const colors = opts.reverse ? opts.colors : opts.colors.slice().reverse();
  rectGroup
    .selectAll("rect")
    .data(colors)
    .join("rect")
    .attr("x", posx)
    .attr("y", (d, i) => posy + i * (opts.rect_height + opts.rect_spacing))
    .attr("width", opts.rect_width)
    .attr("height", opts.rect_height)
    .attr("fill", (d) => d)
    .attr("stroke", opts.rect_stroke);

  // Draw labels: top, middle, bottom
  const labels = [opts.text_high, opts.text_intermediate, opts.text_low];
  const n = opts.colors.length;
  const totalHeight = n * opts.rect_height + (n - 1) * opts.rect_spacing;

  const values = layer.append("g"); // group for texts
  values
    .selectAll("text")
    .data(labels)
    .join("text")
    .attr("x", posx + opts.rect_width + 5)
    .attr("y", (d, i) => {
      if (i === 0) return posy + opts.rect_height / 2; // top
      if (i === 1) return posy + totalHeight / 2; // middle
      if (i === 2) return posy + totalHeight - opts.rect_height / 2; // bottom
    })
    .text((d) => d)
    .attr("font-size", opts.values_fontSize)
    .attr("fill", opts.values_fill)
    .attr("dominant-baseline", "middle");

  // Add note if any
  addNote(layer, opts);

  // Add frame if requested
  if (opts.frame) addFrame(layer, opts);

  // Output: render or return layer ID
  if (newcontainer) {
    const newSize = getsize(layer);
    svg
      .attr("width", newSize.width)
      .attr("height", newSize.height)
      .attr("viewBox", [newSize.x, newSize.y, newSize.width, newSize.height]);
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
