import * as geoScaleBar from "d3-geo-scale-bar";
const d3 = Object.assign({}, geoScaleBar);
import { create } from "../container/create";
import { render } from "../container/render";
import { unique, camelcasetodash } from "../helpers/utils";

/**
 * @description The `scalebar` function allows add a scalebar.
 * @see {@link https://observablehq.com/@neocartocnrs/layout-marks}
 * @see {@link  https://observablehq.com/@neocartocnrs/geoviz-scalebar}
 *
 * @param {SVGSVGElement} arg1 - SVG container (optional)
 * @param {object} arg2 - options and parameters
 * @param {string} arg2.id - id of the layer
 * @param {number[]} arg2.pos - position [x,y] on the page. The scale value is relevant for this location on the map (default: [10, svg.height - 20])
 * @param {number[]} arg2.translate - an array of two values to move the scalebar without change its size (default: null)
 * @param {string} arg2.units - "ft" (feet), "km" (kilometers), "m" (meters) or "mi" (miles) (default: "km")
 * @param {string} arg2.label - label to display (default: undefined)
 * @param {string} arg2.tickSize - tick padding (default: 5)
 * @param {string} arg2.tickPadding - tick size (default: 0.2)
 * @param {number} arg2.distance - distance represented by the scalebar (default: undefined)
 * @param {function} arg2.tickFormat - a function to format values (default: d => d)
 * @param {number[]} arg2.tickValues - values to display on the scalebar (default: undefined)
 * @param {string} arg2.labelAnchor - position of the label ("start", "middle" or "end") (default: "start")
 * @example
 * geoviz.scalebar(svg, { units:"km", distance: 500, pos: [100, 200] }) // where svg is the container
 * svg.scalebar({ units:"km", distance: 500, pos: [100, 200] }) // where svg is the container
 * @returns {SVGSVGElement|string} - the function adds a layer with a scalebar. If the container is not defined, then the layer is displayed directly.
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
  let svg = newcontainer ? create() : arg1;

  // Arguments
  const options = {
    mark: "scalebar",
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
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // Warning
  if (svg.initproj == "none" && svg.warning) {
    svg.warning_message.push(`Scalebar mark`);
    svg.warning_message.push(
      `The scale bar is not relevant without defining a projection function function in the SVG container`
    );
  }

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
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
