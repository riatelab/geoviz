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
} from "./helpers.js";
import { formatLocale } from "d3-format";
import { sum, cumsum } from "d3-array";
const d3 = Object.assign({}, { formatLocale, sum, cumsum });

export function circles(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
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
