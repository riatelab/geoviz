import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash } from "../helpers/camelcase";
import { getsize } from "../helpers/getsize";
import { picto } from "../helpers/picto";
import {
  addTitle,
  addSubtitle,
  addNote,
  subsetobj,
  addFrame,
  manageoptions,
} from "../helpers/utils_legend.js";

/**
 * @function legend/symbol_vertical
 * @description The `legend.symbol_vertical` function allows to add an vertical legend on a map for symbol layers. The function adds a legend layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/legends}
 * @property {string} [id] - unique id
 * @property {number[]} [pos = [0,0]] - legend position
 * @property {number} [gap = 2] - gap between elements
 * @property {string[]} [types = ["A", "B", "C", "D"]] - types
 * @property {string[]} [symbols = ["circle", "square", "triangle", "pentagon"]] - symbols
 * @property {boolean} [alphabetical = true] - alphabetical order
 * @property {number} [symbol_size = 10] - size of the symbol (radius)
 * @property {number} [symbol_rotate = 0] - angle of the symbols
 * @property {number} [symbol_spacing = 4] - spacing between symbols
 * @property {string} [symbol_fill = "#2e2e2e"] - box color
 * @property {string} [symbol_stroke = "#303030"] - stroke color
 * @property {string} [symbol_strokeWidth = 0.5] - stroke width
 * @property {*} symbol_foo - *other SVG attributes that can be applied on this symbol element (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @property {boolen} [symbol_background = false] - circles under the symbol
 * @property {*} symbol_background_foo - *other SVG attributes that can be applied on this circle element (fill, stroke, fillOpacity...)
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
export function symbol_vertical(arg1, arg2) {
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
    symbols: ["circle", "square", "triangle", "pentagon"],
    alphabetical: true,
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
    let all = opts.types.map((d, i) => [d, opts.symbols[i]]).sort();
    opts.types = all.map((d) => d[0]);
    opts.symbols = all.map((d) => d[1]);
  }

  // Pictos
  const accessor = new Map(picto.map((d) => [d.name, d.d]));
  const factor = opts.symbol_background ? 12 : 10;

  // Boxes
  let size = getsize(layer);
  let symb = layer.append("g");
  let opts_symbol = subsetobj(opts, {
    prefix: "symbol_",
    exclude: ["fill", "r", "size", "spacing"],
  });

  // background properties
  opts.symbol_background_fill = opts.symbol_background_fill || opts.symbol_fill;
  opts.symbol_background_fillOpacity =
    opts.symbol_background_fillOpacity || 0.3;
  opts.symbol_background_stroke =
    opts.symbol_background_stroke || opts.symbol_fill;
  let opts_symbol_background = subsetobj(opts, {
    prefix: "symbol_background_",
    exclude: ["r", "size", "transform"],
  });

  Object.entries(opts_symbol).forEach((d) =>
    symb.attr(camelcasetodash(d[0]), d[1])
  );

  let posy = opts.pos[1] + size.height + opts.gap + opts.symbol_dy;
  let posx = opts.pos[0] + opts.symbol_dx;

  if (opts.symbol_background) {
    let circles = symb.append("g");

    circles
      .selectAll("circle")
      .data(opts.symbols)
      .join("circle")
      .attr("r", opts.symbol_size)
      .attr("fill", "white")
      .attr("stroke", "none")
      .attr(
        "transform",
        (d, i) =>
          `translate(${opts.symbol_size + posx},${
            opts.symbol_size +
            posy +
            opts.symbol_spacing / 2 +
            i * (opts.symbol_size * 2 + opts.symbol_spacing)
          })`
      );

    let m = circles
      .selectAll("circle")
      .data(opts.symbols)
      .join("circle")
      .attr("r", opts.symbol_size)
      .attr(
        "transform",
        (d, i) =>
          `translate(${opts.symbol_size + posx},${
            opts.symbol_size +
            posy +
            opts.symbol_spacing / 2 +
            i * (opts.symbol_size * 2 + opts.symbol_spacing)
          })`
      );

    Object.entries(opts_symbol_background)
      .map((d) => d[0])
      .forEach((d) => {
        m.attr(camelcasetodash(d), opts_symbol_background[d]);
      });
  }

  symb
    .selectAll("path")
    .data(opts.symbols)
    .join("path")
    .attr("d", (d) => accessor.get(d))
    .attr("vector-effect", "non-scaling-stroke")
    .attr(
      "transform",
      (d, i) =>
        `translate(${opts.symbol_size + posx},${
          opts.symbol_size +
          posy +
          opts.symbol_spacing / 2 +
          i * (opts.symbol_size * 2 + opts.symbol_spacing)
        }) scale(${opts.symbol_scale || opts.symbol_size / factor}) rotate(${
          opts.symbol_rotate
        }) skewX(${opts.symbol_skewX}) skewY(${opts.symbol_skewY})`
    );

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
    .attr("x", opts.symbol_size * 2 + posx + opts.values_dx)
    .attr(
      "y",
      (d, i) =>
        opts.symbol_size +
        posy +
        opts.symbol_spacing / 2 +
        i * (opts.symbol_size * 2 + opts.symbol_spacing) +
        opts.values_dy
    )
    .text((d) => d);

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
