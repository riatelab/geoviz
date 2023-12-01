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
const d3 = Object.assign({}, { formatLocale });

export function circles_nested(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
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
