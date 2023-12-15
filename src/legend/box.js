import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash } from "../helpers/camelcase";
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

/**
 * @description The `box` function allows to add a box legend on a map
 * @see {@link https://observablehq.com/@neocartocnrs/legends}
 *
 * @param {SVGSVGElement} arg1 - SVG container (optional)
 * @param {object} arg2 - options and parameters
 * @param {"string"} arg2.id - unique id
 * @param {number[]} arg2.pos - legend position (default:[0,0])
 * @param {number} arg2.gap - gap between elements

 * @param {string} arg2.rect_width - width of the box (default: 25)
 * @param {string} arg2.rect_height - height of the box (default: 17)
 * @param {string} arg2.rect_fill - box color (default: "#5d6266")
 * @param {*} arg2.rect_foo - *other SVG attributes that can be applied on this rect element (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 
 * @param {string} arg2.label - text diplayed
 * @param {*} arg2.label_foo - *SVG attributes that can be applied on this text element (fill, fontize...)*

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
 * geoviz.legend.box(svg, { pos: [10,20], label:"hello" }) // where svg is the container
 * svg.legend.box(svg, { pos: [10,20], label:"hello" }) // where svg is the container
 * geoviz.legend.box({ label:"hello" }) // no container
 *
 * @returns {SVGSVGElement|string} - the function adds a layer with a box legend to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 */

export function box(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;

  // Arguments
  const options = {
    title: undefined,
    label: "label",
    rect_fill: "#5d6266",
  };
  let opts = manageoptions(options, newcontainer ? arg1 : arg2, svg.fontFamily);

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();
  opts = subsetobj(opts, { prefix: "", exclude: ["id", "mark"] });

  // Title
  addTitle(layer, opts);

  // Subtitle
  addSubtitle(layer, opts);

  // Box
  let size = getsize(layer);
  let opts_rect = subsetobj(opts, { prefix: "rect_", exclude: ["dx", "dy"] });
  opts_rect.x = opts.pos[0] + opts_rect.dx;
  opts_rect.y =
    size.height == 0
      ? opts.pos[1] + opts_rect.dy
      : size.y + size.height + opts.gap + opts_rect.dy;
  let box = layer.append("rect");
  Object.entries(opts_rect).forEach((d) =>
    box.attr(camelcasetodash(d[0]), d[1])
  );

  // Label

  size = getsize(layer);
  const opts_label = Object.assign(
    subsetobj(opts, { prefix: "label_" }),
    subsetobj(opts, { prefix: "text_" })
  );
  opts_label.text = opts.label;
  opts_label.pos = [
    opts.pos[0] + opts_rect.width,
    opts.pos[1] + size.height - opts_rect.height / 2, // CORRIGER ICI
  ];
  addText(layer, opts_label);

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
