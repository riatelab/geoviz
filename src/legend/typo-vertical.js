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
 * @function legend/typo_vertical
 * @description The `legend.typo_vertical` function allows to add an vertical legend on a map for typo layers. The function adds a legend layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/legends}
 * @property {string} [id] - unique id
 * @property {number[]} [pos = [0,0]] - legend position
 * @property {number} [gap = 2] - gap between elements
 * @property {string[]} [types = ["A", "B", "C", "D"]] - types
 * @property {string[]} [colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"]] - colors
 * @property {boolean} [alphabetical = true] - alphabetical order
 * @property {number} [rect_width = 25] - width of the box
 * @property {number} [rect_height = 17] - height of the box
 * @property {number} [rect_spacing = 3] - spacing between boxes
 * @property {string} [rect_fill = "#5d6266"] - box color
 * @property {string} [rect_stroke = "#303030"] - stroke color
 * @property {string} [rect_strokeWidth = 0.1] - stroke width
 * @property {*} rect_foo - *other SVG attributes that can be applied on this rect element (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @property {string} values_textAnchor - text-anchor (default: "middle")
 * @property {number} values_dx - shift in x (default: 0)
 * @property {number} values_dx - shift in y (default: 5)
 * @property {number} [values_fill = "#363636"] - fill
 * @property {number} [values_fontSize = 10] - fontSize
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
 * geoviz.legend.typo_vertical(svg, { pos: [10,20], types, colors}) // where svg is the container
 * svg.legend.typo_vertical({pos: [10,20], types, colors} }) // where svg is the container
 * svg.plot({type: "leg_typo_vertical", pos: [10,20], types, colors} }) // where svg is the container
 * geoviz.legend.typo_vertical({ pos: [10,20], types, colors}) // no container
 */

export function typo_vertical(arg1, arg2) {
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
    rect_spacing: 3,
  };
  let opts = manageoptions(options, newcontainer ? arg1 : arg2, svg.fontFamily);

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg
        .append("g")
        .attr("id", opts.id)
        .attr("class", "geovizlegend")
        .attr("data-layer", "legend")
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
    .attr("x", posx)
    .attr(
      "y",
      (d, i) =>
        posy +
        opts.rect_spacing / 2 +
        i * (opts.rect_height + opts.rect_spacing)
    )
    .attr("width", opts.rect_width)
    .attr("height", opts.rect_height)
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

  values
    .selectAll("text")
    .data(opts.types)
    .join("text")
    .attr("x", posx + opts.rect_width + opts.values_dx)
    .attr(
      "y",
      (d, i) =>
        posy +
        opts.rect_spacing / 2 +
        i * (opts.rect_height + opts.rect_spacing) +
        opts.rect_height / 2
    )
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
