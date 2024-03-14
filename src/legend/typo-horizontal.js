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
 * @function typo_horizontal (legend)
 * @description The `typo_horizontal` function allows to add an horizontal legend on a map for typo layers
 * @see {@link https://observablehq.com/@neocartocnrs/legends}
 *
  * @property {"string"} id - unique id
 * @property {number[]} pos - legend position (default:[0,0])
 * @property {number} gap - gap between elements
 
 * @property {string[]} types - types (default: ["A", "B", "C", "D"])
 * @property {string[]} colors - colors (default: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"])
 * @property {boolean} alphabetical - alphabetical order (default: true) 


 * @property {string} rect_width - width of the box (default: 50)
 * @property {string} rect_height - height of the box (default: 14)
 * @property {number} rect_spacing - spacing between boxes
 * @property {*} rect_foo - *other SVG attributes that can be applied on this rect element (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 
 * @property {string} values_textAnchor - text-anchor (default: "middle")
 * @property {number} values_dx - shift in x (default: 0)
 * @property {number} values_dx - shift in y (default: 5)
 * @property {*} values_foo - *SVG attributes that can be applied on this text element (fill, fontSize...)*

* @property {string} title - title of the legend
 * @property {string|number} title_foo - *SVG attributes that can be applied on this text element*
 * @property {string} subtitle - subtitle of the legend
 * @property {string|number} subtitle_foo - *SVG attributes that can be applied on this text element*
 * @property {string} note - note displayed above the legend
 * @property {string|number} note_foo - *SVG attributes that can be applied on this text element*
 * @property {boolean} frame - frame around the legend (default: false)
 * @property {string|number} frame_foo - *SVG attributes that can be applied on this frame element (rect)*
 * @property {string|number} text_foo - *SVG attributes that can be applied directly on all text elements of this legend*

* @example
 * // There are several ways to use this function
 * geoviz.legend.typo_horizontal(svg, { pos: [10,20], types, colors}) // where svg is the container
 * svg.legend.typo_horizontal({pos: [10,20], types, colors} }) // where svg is the container
 * svg.plot({type: "leg_typo_horizontal", pos: [10,20], types, colors} }) // where svg is the container
 * geoviz.legend.typo_horizontal({ pos: [10,20], types, colors}) // no container
 *
 * @returns {SVGSVGElement|string} - the function adds a layer with a typo legend to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 */

export function typo_horizontal(arg1, arg2) {
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
    types: ["A", "B", "C", "D"],
    colors: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"],
    alphabetical: true,
    values_dx: 0,
    values_dy: 5,
    values_textAnchor: "middle",
    rect_spacing: 3,
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

  // Sort
  if (opts.alphabetical) {
    let all = opts.types.map((d, i) => [d, opts.colors[i]]).sort();
    opts.types = all.map((d) => d[0]);
    opts.colors = all.map((d) => d[1]);
  }

  // Boxes
  let size = getsize(layer);
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
    .data(opts.colors)
    .join("rect")
    .attr("x", (d, i) => posx + i * (opts.rect_spacing + opts.rect_width))
    .attr("y", posy)
    .attr("width", opts.rect_width)
    .attr("height", opts.rect_height)
    .attr("fill", "red")
    .attr("fill", (d) => d);

  // values
  let values = layer.append("g");
  const opts_values = Object.assign(
    subsetobj(opts, { prefix: "values_" }),
    subsetobj(opts, { prefix: "text_" })
  );

  Object.entries(opts_values).forEach((d) =>
    values.attr(camelcasetodash(d[0]), d[1])
  );

  size = getsize(layer);

  values
    .selectAll("text")
    .data(opts.types)
    .join("text")
    .attr(
      "x",
      (d, i) =>
        posx + i * (opts.rect_spacing + opts.rect_width) + opts.rect_width / 2
    )
    .attr("y", opts.pos[1] + size.height + opts.gap + opts.values_dy)
    .text((d) => d);

  // Missing

  if (opts.missing) {
    let missing = layer.append("g");
    let size = getsize(layer);
    let opts_rect = subsetobj(opts, { prefix: "rect_", exclude: ["dx", "dy"] });
    opts_rect.fill = opts.missing_fill;
    opts_rect.x = opts.pos[0] + opts_rect.dx;
    opts_rect.y =
      size.y +
      size.height +
      opts.gap +
      opts_rect.dy +
      Math.max(opts.gap, opts.rect_spacing);
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
        Math.max(opts.gap, opts.rect_spacing),
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
