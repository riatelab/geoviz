import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash } from "../helpers/camelcase";
import { datatoradius } from "../helpers/datatoradius";
import { getsize } from "../helpers/getsize";
import {
  addTitle,
  addSubtitle,
  addNote,
  subsetobj,
  manageoptions,
  addFrame,
} from "../helpers/utils_legend.js";
import { formatLocale } from "d3-format";
import { sum, cumsum } from "d3-array";
const d3 = Object.assign({}, { formatLocale, sum, cumsum });

/**
 * @function legend/squares
 * @description The `legend.squares` function allows to add an legend for proportional squares. The function adds a legend layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/legends}
 * @property {string} [id] - unique id
 * @property {number[]} [pos = [0,0]] - legend position
 * @property {number} [gap = 2] - gap between elements
 * @property {number[]} data - input values
 * @property {number} [k = 100] - side of the largest square (or corresponding to the value defined by fixmax )
 * @property {string[]} [fixmax = null] - value matching the square with size k . Setting this value is useful for making maps comparable with each other
 * @property {number} [nb = 4] - number of squares
 * @property {string} [square_fill = "none"] - fill color for the squares
 * @property {string} [square_stroke = "#363636"] - stroke color for the squares
 * @property {string} [square_spacing = 5] - spacing between squares
 * @property {*} [square_*] - *SVG attributes that can be applied on this square element *
 * @property {string} [line_stroke = "#363636"] - stroke color for the lines
 * @property {string} [line_strokeDasharray = 1] - stroke-dasharray
 * @property {string} [line_strokeWidth = 0.7] - stroke-width
 * @property {string} [line_length = 10] - length of the line
 * @property {*} [line_*] - *SVG attributes that can be applied on this line element *
 * @property {string} [values_textAnchor = "start"] - text-anchor
 * @property {number} values_dx - shift in x (default: 0)
 * @property {number} values_dx - shift in y (default: 5)
 * @property {number} [values_fill = "#363636"] - fill
 * @property {number} [values_fontSize = 10] - fontSize
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
 * geoviz.legend.squares(svg, { pos: [10,20], data, nb:5}) // where svg is the container
 * svg.legend.squares({pos: [10,20], data, nb: 5} }) // where svg is the container
 * svg.plot({type: "leg_squares", pos: [10,20], data, nb: 5} }) // where svg is the container
 * geoviz.legend.squares({ pos: [10,20], data, nb: 5}) // no container
 */

export function squares(arg1, arg2) {
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
  let options = {
    data: [1, 1000],
    k: 50,
    fixmax: null,
    nb: 4,
    values_dx: 2,
    values_dominantBaseline: "middle",
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

  // Squares
  let arr = datatoradius(opts.data, {
    nb: opts.nb,
    factor: opts.values_factor,
    round: opts.values_round,
    fixmax: opts.fixmax,
    k: opts.k,
  })
    .slice()
    .reverse();
  let rmax = arr[0][1];
  let cumdiam = d3.cumsum(arr.map((d) => d[1]));
  let legsquares = layer.append("g");

  // Squares
  let size = getsize(layer);
  let squares = legsquares
    .selectAll("rect")
    .data(arr)
    .join("rect")
    .attr("x", 0)
    .attr("x", 0)
    .attr("height", (d) => d[1] * 2)
    .attr("width", (d) => d[1] * 2)
    .attr(
      "transform",
      (d, i) =>
        `translate(${opts.pos[0] + opts.square_dx + rmax - d[1]}, ${
          opts.pos[1] +
          size.height +
          opts.square_dy +
          opts.gap -
          d[1] * 2 +
          cumdiam[i] * 2 +
          i * opts.square_spacing
        } )`
    );

  let opts_square = subsetobj(opts, {
    prefix: "square_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_square).forEach((d) =>
    squares.attr(camelcasetodash(d[0]), d[1])
  );

  // Lines

  let lines = legsquares
    .selectAll("line")
    .data(arr)
    .join("line")
    //.attr("x1", (d) => opts.pos[0] + d[1] + opts.square_dx)
    .attr("x1", (d) => opts.pos[0] + d[1] * 2 + opts.square_dx + rmax - d[1])
    .attr("x2", opts.pos[0] + rmax * 2 + opts.line_length + opts.square_dx)
    .attr(
      "y1",
      (d, i) =>
        opts.pos[1] +
        size.height +
        opts.square_dy +
        opts.gap -
        d[1] * 2 +
        d[1] +
        cumdiam[i] * 2 +
        i * opts.square_spacing
    )
    .attr(
      "y2",
      (d, i) =>
        opts.pos[1] +
        size.height +
        opts.square_dy +
        opts.gap -
        d[1] * 2 +
        d[1] +
        cumdiam[i] * 2 +
        i * opts.square_spacing
    );

  let opts_line = subsetobj(opts, {
    prefix: "line_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_line).forEach((d) =>
    lines.attr(camelcasetodash(d[0]), d[1])
  );

  // Values

  let locale = d3.formatLocale({
    decimal: opts.values_decimal,
    thousands: opts.values_thousands,
    grouping: [3],
  });

  let values = legsquares
    .selectAll("text")
    .data(arr)
    .join("text")
    .attr(
      "x",
      opts.pos[0] +
        rmax * 2 +
        opts.line_length +
        opts.square_dx +
        opts.values_dx
    )
    .attr(
      "y",
      (d, i) =>
        opts.pos[1] +
        size.height +
        opts.square_dy +
        opts.gap -
        d[1] * 2 +
        d[1] +
        cumdiam[i] * 2 +
        i * opts.square_spacing
    )
    .text((d) => locale.format(",")(d[0]));

  let opts_values = subsetobj(opts, {
    prefix: "values_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_values).forEach((d) =>
    values.attr(camelcasetodash(d[0]), d[1])
  );

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
