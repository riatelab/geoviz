import { create } from "../container/create";
import { render } from "../container/render";
import * as geoScaleBar from "d3-geo-scale-bar";
import { zoom, zoomTransform } from "d3-zoom";

const d3 = Object.assign(
  {},

  geoScaleBar,
  { zoom, zoomTransform }
);

import { unique } from "../helpers/unique";
import { addattr } from "../helpers/addattr";

/**
 * The `scalebar` function allows add a scalebar.
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id of the layer
 * @param {number[]} options.pos - position [x,y] on the page. The scale value is relevant for this location on the map
 * @param {number[]} options.translate - an array of two values to move the scalebar without change its size
 * @param {string} options.units - "ft" (feet), "km" (kilometers), "m" (meters) or "mi" (miles)
 * @param {string} options.label - label to display
 * @param {string} options.tickSize - tick padding
 * @param {string} options.tickPadding - tick size
 * @param {number} options.distance - distance represented by the scalebar
 * @param {function} options.tickFormat - a function to format values
 * @param {number[]} options.tickValues - values to display on the scalebar
 * @param {string} options.labelAnchor - position of the label ("start", "middle" or "end")
 * @example
 * geoviz.layer.scalebar(svg, { units:"km", distance: 500, pos: [100, 200] })
 * @returns {SVGSVGElement|string} - the function adds a layer with a scalebar
 */

export function scalebar(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;
  let options = newcontainer ? arg1 : arg2;

  // Default values
  let opts = {
    id: unique(),
    pos: [10, svg.height - 20],
    translate: null,
    units: "km",
    label: undefined,
    tickPadding: 5,
    tickSize: 0.2,
    distance: undefined,
    tickFormat: (d) => d,
    tickValues: undefined,
    labelAnchor: "start",
  };

  Object.keys(opts).forEach((d) => {
    if (options[d] !== undefined) {
      opts[d] = options[d];
    }
  });

  Object.keys(options).forEach((d) => {
    opts[d] = options[d];
  });

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg
        .append("g")
        .attr("id", opts.id)
        .attr("class", svg.inset ? "nozoom" : "zoomablescalebar")
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  //...attr
  addattr({
    layer,
    args: opts,
    exclude: [],
  });

  let units = new Map([
    ["ft", d3.geoScaleFeet],
    ["km", d3.geoScaleKilometers],
    ["m", d3.geoScaleMeters],
    ["mi", d3.geoScaleMiles],
  ]).get(opts.units);

  const x = opts.pos[0] / svg.width;
  const y = opts.pos[1] / svg.height;

  const scaleBar = d3
    .geoScaleBar()
    .projection(svg.projection)
    .size([svg.width, svg.height])
    .left(x)
    .top(y)
    .distance(opts.distance)
    .label(opts.label !== undefined ? opts.label : units.units)
    .units(units)
    .tickPadding(opts.tickPadding)
    .tickSize(opts.tickSize)
    .tickFormat(opts.tickFormat)
    .tickValues(opts.tickValues)
    .labelAnchor(opts.labelAnchor);

  layer.attr(
    "data-layer",
    JSON.stringify({
      size: [svg.width, svg.height],
      left: x,
      top: y,
      distance: opts.distance,
      label: opts.label !== undefined ? opts.label : units.units,
      units: units,
      tickPadding: opts.tickPadding,
      tickSize: opts.tickSize,
      tickFormat: opts.tickFormat.toString(),
      tickValues: opts.tickValues,
      labelAnchor: opts.labelAnchor,
      translate: opts.translate,
      pos: opts.pos,
    })
  );

  layer.call(scaleBar);

  if (opts.translate) {
    layer.attr(
      "transform",
      `translate(${opts.pos[0] + opts.translate[0]},${
        opts.pos[1] + opts.translate[1]
      })`
    );
  }

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
