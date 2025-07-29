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
const d3 = Object.assign({}, { formatLocale });

/**
 * @function legend/circles_nested
 * @description The `legend.circles_nested` function allows to add an legend for proportional circles. The function adds a legend layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/legends}
 * @property {string} [id] - unique id
 * @property {number[]} [pos = [0,0]] - legend position
 * @property {number} [gap = 2] - gap between elements
 * @property {number[]} data - input values
 * @property {number} [k = 50] - radius of the largest circle (or corresponding to the value defined by fixmax )
 * @property {string[]} [fixmax = null] - value matching the circle with radius k . Setting this value is useful for making maps comparable with each other
 * @property {number} [nb = 4] - number of circles
 * @property {string} [circle_fill = "none"] - fill color for the circles
 * @property {string} [circle_stroke = "#363636"] - stroke color for the circles
 * @property {*} [circle_*] - *SVG attributes that can be applied on this circle element *
 * @property {string} [line_stroke = "#363636"] - stroke color for the lines
 * @property {string} [line_strokeDasharray = 1] - stroke-dasharray
 * @property {string} [line_strokeWidth = 0.7] - stroke-width
 * @property {string} [line_length = 10] - length of the line
 * @property {*} [line_***] - *SVG attributes that can be applied on this line element *
 * @property {string} [values_textAnchor = "start"] - text-anchor
 * @property {number} [values_dx = 5] - shift in x
 * @property {number} [values_dy = 0] - shift in y
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
 * geoviz.legend.circles_nested(svg, { pos: [10,20], data, nb:5}) // where svg is the container
 * svg.legend.circles_nested({pos: [10,20], data, nb: 5} }) // where svg is the container
 * svg.plot({type: "leg_circles_nested", pos: [10,20], data, nb: 5} }) // where svg is the container
 * geoviz.legend.circles_nested({ pos: [10,20], data, nb: 5}) // no container
 */

export function circles_nested(arg1, arg2) {
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

  // Circles
  let arr = datatoradius(opts.data, {
    nb: opts.nb,
    factor: opts.values_factor,
    round: opts.values_round,
    fixmax: opts.fixmax,
    k: opts.k,
  });
  let rmax = arr[arr.length - 1][1];
  let nestedcircles = layer.append("g");

  // Circles
  let size = getsize(layer);
  let circles = nestedcircles
    .selectAll("circle")
    .data(arr.reverse())
    .join("circle")
    .attr("r", (d) => d[1])
    .attr(
      "transform",
      (d) =>
        `translate(${opts.pos[0] + rmax + opts.circle_dx}, ${
          opts.pos[1] +
          opts.circle_dy +
          opts.gap +
          size.height +
          rmax * 2 -
          d[1]
        })`
    );

  let opts_circle = subsetobj(opts, {
    prefix: "circle_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_circle).forEach((d) =>
    circles.attr(camelcasetodash(d[0]), d[1])
  );

  // Lines

  let lines = nestedcircles
    .selectAll("line")
    .data(arr)
    .join("line")
    .attr("x1", opts.pos[0] + rmax + opts.circle_dx)
    .attr("x2", opts.pos[0] + rmax + rmax + opts.line_length + opts.circle_dx)
    .attr(
      "y1",
      (d) =>
        opts.pos[1] +
        opts.circle_dy +
        opts.gap +
        size.height +
        rmax * 2 -
        d[1] * 2
    )
    .attr(
      "y2",
      (d) =>
        opts.pos[1] +
        opts.circle_dy +
        opts.gap +
        size.height +
        rmax * 2 -
        d[1] * 2
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

  let values = nestedcircles
    .selectAll("text")
    .data(arr)
    .join("text")
    .attr(
      "x",
      opts.pos[0] +
        rmax +
        rmax +
        opts.line_length +
        opts.circle_dx +
        opts.values_dx
    )
    .attr(
      "y",
      (d) =>
        opts.pos[1] +
        opts.circle_dy +
        opts.gap +
        size.height +
        rmax * 2 -
        d[1] * 2
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
