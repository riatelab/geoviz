import * as geoScaleBar from "d3-geo-scale-bar";
import { geoNaturalEarth1 } from "d3-geo";
const d3 = Object.assign({ geoNaturalEarth1 }, geoScaleBar);
import { create } from "../container/create";
import { render } from "../container/render";
import { unique, camelcasetodash } from "../helpers/utils";

/**
 * @function scalebar
 * @description The `scalebar` function allows add a scalebar. The function adds a layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/layout-marks}
 * @see {@link  https://observablehq.com/@neocartocnrs/geoviz-scalebar}
 *
 * @property {string} [id] - id of the layer
 * @property {number[]} [pos = 10, svg.height - 20] - position [x,y] on the page. The scale value is relevant for this location on the map
 * @property {number[]} [translate = null] - an array of two values to move the scalebar without change its size
 * @property {string} [units = "km"] - "ft" (feet), "km" (kilometers), "m" (meters) or "mi" (miles)
 * @property {string} [label] - label to display
 * @property {string} [tickSize = 5] - tick padding
 * @property {string} [tickPadding = 0.2] - tick size
 * @property {number} [distance] - distance represented by the scalebar
 * @property {function} [tickFormat = d => d] - a function to format values
 * @property {number[]} [tickValues] - values to display on the scalebar
 * @property {string} [labelAnchor = "start"] - position of the label ("start", "middle" or "end")
 * @property {*} [svg_*]  - *parameters of the svg container created if the layer is not called inside a container (e.g svg_width)*
 * @example
 * // There are several ways to use this function
 * geoviz.scalebar(svg, { units:"km", distance: 500, pos: [100, 200] }) // where svg is the container
 * svg.scalebar({ units:"km", distance: 500, pos: [100, 200] }) // where svg is the container
 * svg.plot({type: "scalebar", units:"km", distance: 500, pos: [100, 200] }) // where svg is the container
 */

export function scalebar(arg1, arg2) {
  // Test if new container
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;

  // Arguments
  const options = {
    mark: "scalebar",
    id: unique(),
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
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // New container
  let svgopts = { projection: d3.geoNaturalEarth1() };
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(0, 4) == "svg_" ? d.slice(4) : d]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

  // Position
  opts.pos = opts.pos || [10, svg.height - 20];

  // Warning
  if (svg.initproj == "none" && svg.warning) {
    svg.warning_message.push(`Scalebar mark`);
    svg.warning_message.push(
      `The scale bar is not relevant without defining a projection function function in the SVG container`
    );
  }

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id).attr("data-layer", "scalebar")
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // zoomable layer
  if (svg.zoomable && !svg.parent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      svg.zoomablelayers.push(opts);
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id)
      );
      svg.zoomablelayers[i] = opts;
    }
  }

  //...attr
  Object.entries(opts)
    .map((d) => d[0])
    .forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });

  // addattr({
  //   layer,
  //   args: opts,
  //   exclude: [],
  // });

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
