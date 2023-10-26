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
 * @param {string} options.labelAnchor - position of the label ("start", "middle" or "end")
 * @example
 * geoviz.layer.scalebar(svg, { units:"km", distance: 500, pos: [100, 200] })
 * @returns {SVGSVGElement|string} - the function adds a layer with a scalebar
 */

export function scalebar(
  svg,
  {
    id = unique(),
    pos = [10, svg.height - 20],
    units = "km",
    label = undefined,
    tickPadding = 5,
    tickSize = 0,
    distance,
    tickFormat = (d) => d,
    tickValues,
    labelAnchor = "start",
    translate = null,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg
        .append("g")
        .attr("id", id)
        .attr("class", svg.inset ? "nozoom" : "zoomablescalebar")
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: [],
  });

  units = new Map([
    ["ft", d3.geoScaleFeet],
    ["km", d3.geoScaleKilometers],
    ["m", d3.geoScaleMeters],
    ["mi", d3.geoScaleMiles],
  ]).get(units);

  const x = pos[0] / svg.width;
  const y = pos[1] / svg.height;

  const scaleBar = d3
    .geoScaleBar()
    .projection(svg.projection)
    .size([svg.width, svg.height])
    .left(x)
    .top(y)
    .distance(distance)
    .label(label !== undefined ? label : units.units)
    .units(units)
    .tickPadding(tickPadding)
    .tickSize(tickSize)
    .tickFormat(tickFormat)
    .tickValues(tickValues)
    .labelAnchor(labelAnchor);

  layer.attr(
    "data-layer",
    JSON.stringify({
      size: [svg.width, svg.height],
      left: x,
      top: y,
      distance: distance,
      label: label !== undefined ? label : units.units,
      units: units,
      tickPadding: tickPadding,
      tickSize: tickSize,
      tickFormat: tickFormat.toString(),
      tickValues: tickValues,
      labelAnchor,
      translate,
      pos,
    })
  );

  layer.call(scaleBar);

  if (translate) {
    layer.attr(
      "transform",
      `translate(${pos[0] + translate[0]},${pos[1] + translate[1]})`
    );
  }

  return `#${id}`;
}
