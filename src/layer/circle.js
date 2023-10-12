import { tooltip } from "../helpers/tooltip";
import { zoomclass } from "../helpers/zoomclass";
import { addattr } from "../helpers/addattr";
import { random } from "../classify/random";
import { unique } from "../helpers/unique";
import { scaleSqrt } from "d3-scale";
import { max, descending } from "d3-array";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { scaleSqrt, max, descending, geoPath });

/**
 * The `circle` function allows to create a layer with circles from a geoJSON (points)
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.data - GeoJSON FeatureCollection (points)
 * @param {string} options.id - id of the layer
 * @param {number|string} options.r - a number or the name of a property containing numerical values.
 * @param {number} options.k - dadius of the largest circle (or corresponding to the value defined by `fixmax`)
 * @param {number} options.fixmax - value matching the circle with radius `k`. Setting this value is useful for making maps comparable with each other
 * @param {string|function} options.projection - use "none" if the coordinates are already in the plan of the page. If this field is left blank, the global container projection is applied.
 * @param {string|function} options.fill - fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} options.stroke - stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} options.tip - tooltip content
 * @param {object} options.tipstyle - tooltip style
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let circles = geoviz.layer.bubble(main, { data: cities, r: "population" })
 * @returns {SVGSVGElement|string} - the function adds a layer with circles to the SVG container and returns the layer identifier.
 */

export function circle(
  svg,
  {
    id = unique(),
    projection,
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
    ? svg
        .append("g")
        .attr("id", id)
        .attr("class", zoomclass(svg.inset, projection))
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fill", "stroke", "r"],
  });

  // Projection
  projection = projection == "none" ? (d) => d : svg.projection;

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
          .filter((d) => d.geometry)
          .filter((d) => d.properties[r] != undefined)
          .sort((a, b) =>
            d3.descending(
              Math.abs(+a.properties[r]),
              Math.abs(+b.properties[r])
            )
          )
      )
      .join("circle")
      .attr("cx", (d) => d3.geoPath(projection).centroid(d.geometry)[0])
      .attr("cy", (d) => d3.geoPath(projection).centroid(d.geometry)[1])
      .attr("r", (d) => radius(Math.abs(d.properties[r])))
      .attr("fill", fill)
      .attr("stroke", stroke)
      .attr("visibility", (d) =>
        isNaN(d3.geoPath(svg.projection).centroid(d.geometry)[0])
          ? "hidden"
          : "visible"
      );
  }

  if (typeof r == "number") {
    layer
      .selectAll("circle")
      .data(data.features.filter((d) => d.geometry))
      .join("circle")
      .attr("cx", (d) => d3.geoPath(projection).centroid(d.geometry)[0])
      .attr("cy", (d) => d3.geoPath(projection).centroid(d.geometry)[1])
      .attr("r", r)
      .attr("fill", fill)
      .attr("stroke", stroke)
      .attr("visibility", (d) =>
        isNaN(d3.geoPath(svg.projection).centroid(d.geometry)[0])
          ? "hidden"
          : "visible"
      );
  }

  if (tip) {
    tooltip(layer, svg, tip, tipstyle);
  }

  return `#${id}`;
}
