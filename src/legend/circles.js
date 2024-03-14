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
 * @function circles (legend)
 * @description The `circles` function allows to add an legend for proprtionnal circles
 * @see {@link https://observablehq.com/@neocartocnrs/legends}
 *
 * @property {string} id - unique id
 * @property {number[]} pos - legend position (default:[0,0])
 * @property {number} gap - gap between elements
 
 * @property {number[]} data - input values 
 * @property {number} k - radius of the largest circle (or corresponding to the value defined by fixmax ) (default: 50)
 * @property {string[]} fixmax - value matching the circle with radius k . Setting this value is useful for making maps comparable with each other
 * @property {number} nb - number of circles

  * @property {string} circle_fill - fill color for the circles
  * @property {string} circle_stroke - stroke color for the circles
  * @property {*} circle_foo - *SVG attributes that can be applied on this circle element *
  * @property {string} line_stroke - stroke color for the lines
  * @property {*} line_foo - *SVG attributes that can be applied on this line element *

 * @property {string} values_textAnchor - text-anchor (default: "middle")
 * @property {number} values_dx - shift in x (default: 0)
 * @property {number} values_dx - shift in y (default: 5)
  * @property {number} values_factor - allow to multiply values to display in the legend. e.g 0.001 to convert into thousands
 * @property {string} values_decimal - separator for decimals
 * @property {string} values_thousands -  separator for thousands
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
 * geoviz.legend.circles(svg, { pos: [10,20], data, nb:5}) // where svg is the container
 * svg.legend.circles({pos: [10,20], data, nb: 5} }) // where svg is the container
 * svg.plot({type: "leg_circles", pos: [10,20], data, nb: 5} }) // where svg is the container
 * geoviz.legend.circles({ pos: [10,20], data, nb: 5}) // no container
 *
 * @returns {SVGSVGElement|string} - the function adds a layer with a circle legend to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 */

export function circles(arg1, arg2) {
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

  // Circles
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
  let cumdiam = d3.cumsum(arr.map((d) => d[1] * 2));
  let legcircles = layer.append("g");

  // Circles
  let size = getsize(layer);
  let circles = legcircles
    .selectAll("circle")
    .data(arr)
    .join("circle")
    .attr("r", (d) => d[1])
    .attr(
      "transform",
      (d, i) =>
        `translate(${opts.pos[0] + rmax + opts.circle_dx}, ${
          opts.pos[1] +
          size.height +
          opts.circle_dy +
          opts.gap -
          d[1] +
          cumdiam[i] +
          i * opts.circle_spacing
        } )`
    );

  let opts_circle = subsetobj(opts, {
    prefix: "circle_",
    exclude: ["dx", "dy"],
  });
  Object.entries(opts_circle).forEach((d) =>
    circles.attr(camelcasetodash(d[0]), d[1])
  );

  // Lines

  let lines = legcircles
    .selectAll("line")
    .data(arr)
    .join("line")
    .attr("x1", (d) => opts.pos[0] + rmax + d[1] + opts.circle_dx)
    .attr("x2", opts.pos[0] + rmax * 2 + opts.line_length + opts.circle_dx)
    .attr(
      "y1",
      (d, i) =>
        opts.pos[1] +
        size.height +
        opts.circle_dy +
        opts.gap -
        d[1] +
        cumdiam[i] +
        i * opts.circle_spacing
    )
    .attr(
      "y2",
      (d, i) =>
        opts.pos[1] +
        size.height +
        opts.circle_dy +
        opts.gap -
        d[1] +
        cumdiam[i] +
        i * opts.circle_spacing
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

  let values = legcircles
    .selectAll("text")
    .data(arr)
    .join("text")
    .attr(
      "x",
      opts.pos[0] +
        rmax * 2 +
        opts.line_length +
        opts.values_dx +
        opts.circle_dx
    )
    .attr(
      "y",
      (d, i) =>
        opts.pos[1] +
        size.height +
        opts.circle_dy +
        opts.gap -
        d[1] +
        cumdiam[i] +
        i * opts.circle_spacing
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
