import { tooltip } from "../helpers/tooltip";
import { addattr } from "../helpers/addattr";
import { random } from "../classify/random";
import { unique } from "../helpers/unique";
import { scaleSqrt } from "d3-scale";
import { max, descending } from "d3-array";
const d3 = Object.assign({}, { scaleSqrt, max, descending });

/**
 * The `bubble` function allows to draw circles from a geoJSON
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} param1 - Options
 * @param {object} param1.data - GeoJSON FeatureCollection (points)
 * @param {string} param1.id - An svg group id
 * @param {number|string} param1.r - a number or the name of a property containing numerical values. 
 * @param {number} param1.k - Radius of the largest circle (or corresponding to the value defined by `fixmax`) 
 * @param {number} param1.fixmax - Value matching the circle with radius `k`. Setting this value is useful for making maps comparable with each other
 * @param {boolean} param1.geocoords - Use `true` if input coordinates are in latitude ans longitude. Use `false` if the coordinates are already defined in the page plan
 * @param {string|function} param1.fill - Fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} param1.stroke - Stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} param1.tip - Tooltip content
 * @param {object} param1.tipstyle - Tooltip style
 * @param {*} param1.foo - *Other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*


 * @example
 * let circles = layer.bubble(main, { data: cities, r: "population" })
 * @returns {SVGSVGElement|string} - The function adds a layer with circles to the SVG container and returns the layer identifier.
 */

export function bubble(
  svg,
  {
    id = unique(),
    geocoords = true,
    data,
    r = 10,
    k = 50,
    fixmax = null,
    fill = random(),
    stroke = "white",
    tip,
    tipstyle,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Attr with specific default values
  layer.attr("fill", fill).attr("stroke", stroke);

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fill", "stroke", "r"],
  });

  const projection = geocoords ? svg.projection : (d) => d;

  if (typeof r == "string") {
    const valmax =
      fixmax != undefined
        ? fixmax
        : d3.max(data.features, (d) => Math.abs(+d.properties[r]));
    let radius = d3.scaleSqrt([0, valmax], [0, k]);

    layer
      .selectAll("circle")
      .data(
        data.features
          .filter((d) => d.geometry.coordinates != undefined)
          .filter((d) => d.properties[r] != undefined)
          .sort((a, b) =>
            d3.descending(
              Math.abs(+a.properties[r]),
              Math.abs(+b.properties[r])
            )
          )
      )
      .join("circle")
      .attr("cx", (d) => projection(d.geometry.coordinates)[0])
      .attr("cy", (d) => projection(d.geometry.coordinates)[1])
      .attr("r", (d) => radius(Math.abs(d.properties[r])));
  }

  if (typeof r == "number") {
    layer
      .selectAll("circle")
      .data(data.features.filter((d) => d.geometry.coordinates != undefined))
      .join("circle")
      .attr("cx", (d) => projection(d.geometry.coordinates)[0])
      .attr("cy", (d) => projection(d.geometry.coordinates)[1])
      .attr("r", r);
  }

  if (tip) {
    tooltip(layer, svg, tip, tipstyle);
  }

  return `#${id}`;
}
