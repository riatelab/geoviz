import * as geoScaleBar from "d3-geo-scale-bar";
const d3 = Object.assign({}, geoScaleBar);
import { unique } from "../helpers/unique";
import { addattr } from "../helpers/addattr";

export function scalebar(
  svg,
  {
    id = unique(),
    pos = [10, 10],
    units = "km",
    label = undefined,
    tickPadding = 5,
    tickSize = 0,
    distance,
    tickFormat = (d) => d,
    tickValues,
    labelAnchor = "start",
    orient = "bottom",
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

  orient = new Map([
    ["top", d3.geoScaleTop],
    ["bottom", d3.geoScaleBottom],
  ]).get(orient);

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
    .orient(orient)
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
      orient: orient.toString(),
      tickPadding: tickPadding,
      tickFormat: tickFormat.toString(),
      tickValues: tickValues,
      labelAnchor,
      labelAnchor,
    })
  );

  layer.call(scaleBar);
  return `#${id}`;
}
