import { create } from "../container/create.js";
import { render } from "../container/render.js";
import { camelcasetodash } from "../helpers/camelcase.js";
import { datatoradius } from "../helpers/datatoradius.js";
import { getsize } from "../helpers/getsize.js";
import {
  addTitle,
  addSubtitle,
  addNote,
  subsetobj,
  manageoptions,
  addFrame,
} from "../helpers/utils_legend.js";
import { formatLocale } from "d3-format";
import { arc } from "d3-shape";
const d3 = Object.assign({}, { formatLocale, arc });

/**
 * @function legend/mushrooms
 * @description The `legend.mushrooms` function allows to add an legend for proportional half-circles. The function adds a legend layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/legends}
 * @see {@link https://observablehq.com/@neocartocnrs/half-circle-mark}
 * @property {string} [id] - unique id
 * @property {number[]} [pos = [0,0]] - legend position
 * @property {number} [gap = 2] - gap between elements
 * @property {string} [line_stroke = "#363636"] - stroke color for the lines
 * @property {string} [line_strokeDasharray = 1] - stroke-dasharray
 * @property {string} [line_strokeWidth = 0.7] - stroke-width
 * @property {string} [line_length = 10] - length of the line
 * @property {*} [line_*] - *SVG attributes that can be applied on this line element *nt*
 * @property {number[]} [top_data] - input values (top for circles)
 * @property {number} [top_k = 50] - radius of the largest top half-circle (or corresponding to the value defined by fixmax)
 * @property {string[]} [top_fixmax = null] - value matching the top circle with radius k . Setting this value is useful for making maps comparable with each other
 * @property {number} [top_nb = 4] - number of top half-circles
 * @property {string} [top_circle_fill = "none"] - fill color for the top half-circles
 * @property {string} [top_circle_stroke = "black"] - stroke color for the top half-circles
 * @property {number} [top_circle_cornerRadius = 5] - top circle_cornerRadius
 * @property {*} [top_circle_*] - *SVG attributes that can be applied on this top half-circle element*
 * @property {string} [top_values_textAnchor = "middle"] - top text-anchor
 * @property {number} [top_values_dx = 5] - shift in x
 * @property {number} [top_values_dy = 0] - shift in y
 * @property {number} [top_values_factor = 1] - allow to multiply values to display in the legend. e.g 0.001 to convert into thousands
 * @property {string} [top_values_decimal = "."] - separator for decimals
 * @property {string} [top_values_thousands = " "] -  separator for thousands
 * @property {*} [top_values_*] - *SVG attributes that can be applied on this text element (fill, fontSize...)*
 * @property {string} [top_title = "top_title"] - title of the top elment
 * @property {number[]} [bottom_data] - input values (bottom for circles)
 * @property {number} [bottom_k = 50] - radius of the largest bottom half-circle (or corresponding to the value defined by fixmax)
 * @property {string[]} [bottom_fixmax = null] - value matching the bottom circle with radius k . Setting this value is useful for making maps comparable with each other
 * @property {number} [bottom_nb = 4] - number of bottom half-circles
 * @property {string} [bottom_circle_fill = "none"] - fill color for the bottom half-circles
 * @property {string} [bottom_circle_stroke = "black"] - stroke color for the bottom half-circles
 * @property {number} [bottom_circle_cornerRadius = 5] - bottom circle_cornerRadius
 * @property {*} [bottom_circle_*] - *SVG attributes that can be applied on this bottom half-circle element*
 * @property {string} [bottom_values_textAnchor = "middle"] - bottom text-anchor
 * @property {number} [bottom_values_dx = 5] - shift in x
 * @property {number} [bottom_values_dy = 0] - shift in y
 * @property {number} [bottom_values_factor = 1] - allow to multiply values to display in the legend. e.g 0.001 to convert into thousands
 * @property {string} [bottom_values_decimal = "."] - separator for decimals
 * @property {string} [bottom_values_thousands = " "] -  separator for thousands
 * @property {*} [bottom_values_*] - *SVG attributes that can be applied on this text element (fill, fontSize...)*
 * @property {string} [bottom_title = "bottom_title"] - title of the bottom elment
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
 * geoviz.legend.mushrooms(svg, { pos: [10,20],top_data, bottom_data}) // where svg is the container
 * svg.legend.mushrooms({pos: [10,20], top_data, bottom_data} }) // where svg is the container
 * svg.plot({ type: "leg_mushrooms", pos: [10,20], top_data, bottom_data} }) // where svg is the container
 * geoviz.legend.mushrooms({ pos: [10,20], top_data, bottom_data}) // no container
 */

export function mushrooms(arg1, arg2) {
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
    top_data: [30, 1000],
    top_k: 50,
    top_title: "top_title",
    top_fixmax: null,
    top_nb: 4,
    top_circle_cornerRadius: 5,
    top_values_dx: 2,
    top_values_dominantBaseline: "middle",
    top_values_textAnchor: "start",

    bottom_data: [30, 1000],
    bottom_k: 50,
    bottom_title: "bottom_title",
    bottom_fixmax: null,
    bottom_nb: 4,
    bottom_circle_cornerRadius: 5,
    bottom_values_dx: 2,
    bottom_values_dominantBaseline: "middle",
    bottom_values_textAnchor: "start",
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

  // Data

  let top_arr = datatoradius(opts.top_data, {
    nb: opts.top_nb,
    factor: opts.top_values_factor,
    round: opts.top_values_round,
    fixmax: opts.top_fixmax,
    k: opts.top_k,
  });

  let bottom_arr = datatoradius(opts.bottom_data, {
    nb: opts.bottom_nb,
    factor: opts.bottom_values_factor,
    round: opts.bottom_values_round,
    fixmax: opts.bottom_fixmax,
    k: opts.bottom_k,
  });

  let rmaxtop = top_arr[top_arr.length - 1][1];
  let rmaxbottom = bottom_arr[bottom_arr.length - 1][1];
  let rmax = Math.max(rmaxtop, rmaxbottom);

  // -------------------
  // TOP
  // -------------------
  let mushlayer = layer.append("g");

  // Circles
  let size = getsize(layer);
  let top = mushlayer
    .selectAll("path")
    .data(top_arr.reverse())
    .join("path")
    .attr("d", (d) =>
      d3
        .arc()
        .outerRadius(d[1])
        .innerRadius(0)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2)
        .cornerRadius(opts.top_circle_cornerRadius)()
    )
    .attr(
      "transform",
      (d) =>
        `translate(${opts.pos[0] + rmax + opts.top_circle_dx}, ${
          opts.pos[1] +
          opts.circle_dy +
          opts.gap +
          opts.top_values_fontSize / 2 +
          size.height +
          rmaxtop
        })`
    );

  let opts_top_circle = subsetobj(opts, {
    prefix: "top_circle_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_top_circle).forEach((d) =>
    top.attr(camelcasetodash(d[0]), d[1])
  );

  // Lines

  let linestop = mushlayer
    .selectAll("line")
    .data(top_arr)
    .join("line")
    .attr("x1", opts.pos[0] + rmax + opts.top_circle_dx)
    .attr(
      "x2",
      opts.pos[0] + rmax + rmax + opts.line_length + opts.top_circle_dx
    )
    .attr(
      "y1",
      (d) =>
        opts.pos[1] +
        opts.top_circle_dy +
        opts.gap +
        size.height +
        rmaxtop -
        d[1] +
        opts.top_values_fontSize / 2
    )
    .attr(
      "y2",
      (d) =>
        opts.pos[1] +
        opts.top_circle_dy +
        opts.gap +
        size.height +
        rmaxtop -
        d[1] +
        opts.top_values_fontSize / 2
    );

  let opts_line = subsetobj(opts, {
    prefix: "line_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_line).forEach((d) =>
    linestop.attr(camelcasetodash(d[0]), d[1])
  );

  // Values
  let top_locale = d3.formatLocale({
    decimal: opts.top_values_decimal,
    thousands: opts.top_values_thousands,
    grouping: [3],
  });

  let top_values = mushlayer
    .selectAll("text")
    .data(top_arr)
    .join("text")
    .attr(
      "x",
      opts.pos[0] +
        rmax +
        rmax +
        opts.line_length +
        opts.top_circle_dx +
        opts.top_values_dx
    )
    .attr(
      "y",
      (d) =>
        opts.pos[1] +
        opts.top_circle_dy +
        opts.gap +
        size.height +
        rmaxtop -
        d[1] +
        opts.top_values_fontSize / 2
    )
    .text((d) => top_locale.format(",")(d[0]));

  let opts_top_values = subsetobj(opts, {
    prefix: "top_values_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_top_values).forEach((d) =>
    top_values.attr(camelcasetodash(d[0]), d[1])
  );

  // top title
  size = getsize(layer);
  let top_title = mushlayer
    .append("text")
    .attr("x", opts.pos[0] + rmax)
    .attr("y", opts.pos[1] + size.height + opts.gap)
    .text(opts.top_title);
  let opts_top_title = subsetobj(opts, {
    prefix: "top_title_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_top_title).forEach((d) =>
    top_title.attr(camelcasetodash(d[0]), d[1])
  );

  // bottom title
  size = getsize(layer);
  let bottom_title = mushlayer
    .append("text")
    .attr("x", opts.pos[0] + rmax)
    .attr("y", opts.pos[1] + size.height + opts.gap)
    .text(opts.bottom_title);
  let opts_bottom_title = subsetobj(opts, {
    prefix: "bottom_title_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_bottom_title).forEach((d) =>
    bottom_title.attr(camelcasetodash(d[0]), d[1])
  );

  // -------------------
  // BOTTOM
  // -------------------

  const mushlayer2 = layer.append("g");

  // Circles
  size = getsize(layer);
  let bottom = mushlayer2
    .selectAll("path")
    .data(bottom_arr.reverse())
    .join("path")
    .attr("d", (d) =>
      d3
        .arc()
        .outerRadius(d[1])
        .innerRadius(0)
        .startAngle(0.5 * Math.PI)
        .endAngle(1.5 * Math.PI)
        .cornerRadius(opts.bottom_circle_cornerRadius)()
    )
    .attr(
      "transform",
      (d) =>
        `translate(${opts.pos[0] + rmax + opts.bottom_circle_dx}, ${
          opts.pos[1] + opts.circle_dy + opts.gap + size.height
        })`
    );

  let opts_bottom_circle = subsetobj(opts, {
    prefix: "bottom_circle_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_bottom_circle).forEach((d) =>
    bottom.attr(camelcasetodash(d[0]), d[1])
  );

  // Lines

  let linesbottom = mushlayer2
    .selectAll("line")
    .data(bottom_arr)
    .join("line")
    .attr("x1", opts.pos[0] + rmax + opts.bottom_circle_dx)
    .attr(
      "x2",
      opts.pos[0] + rmax + rmax + opts.line_length + opts.bottom_circle_dx
    )
    .attr(
      "y1",
      (d) => opts.pos[1] + opts.bottom_circle_dy + opts.gap + size.height + d[1]
    )
    .attr(
      "y2",
      (d) => opts.pos[1] + opts.bottom_circle_dy + opts.gap + size.height + d[1]
    );

  Object.entries(opts_line).forEach((d) =>
    linesbottom.attr(camelcasetodash(d[0]), d[1])
  );

  // Values
  let bottom_locale = d3.formatLocale({
    decimal: opts.bottom_values_decimal,
    thousands: opts.bottom_values_thousands,
    grouping: [3],
  });

  let bottom_values = mushlayer2
    .selectAll("text")
    .data(bottom_arr)
    .join("text")
    .attr(
      "x",
      opts.pos[0] +
        rmax +
        rmax +
        opts.line_length +
        opts.bottom_circle_dx +
        opts.bottom_values_dx
    )
    .attr(
      "y",
      (d) => opts.pos[1] + opts.bottom_circle_dy + opts.gap + size.height + d[1]
    )
    .text((d) => bottom_locale.format(",")(d[0]));

  let opts_bottom_values = subsetobj(opts, {
    prefix: "bottom_values_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_bottom_values).forEach((d) =>
    bottom_values.attr(camelcasetodash(d[0]), d[1])
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
