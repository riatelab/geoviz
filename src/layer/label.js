import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
import { zoomclass } from "../helpers/zoomclass";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

/**
 * The `label` function allows to create a label layer from a geoJSON (points)
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.data - GeoJSON FeatureCollection (points)
 * @param {string} options.id - id of the layer
 * @param {string|function} options.projection - use "none" if the coordinates are already in the plan of the page. If this field is left blank, the global container projection is applied.
 * @param {string|function} options.text - text to display. Name of the property or a function
 * @param {string|function} options.fill - fill color
 * @param {string|function} options.stroke - stroke color
 * @param {string|function} options.dx - horizontal displacement
 * @param {string|function} options.dy - vertical displacement
 * @param {string|function} options.fontSize - font size
 * @param {string|function} options.dominantBaseline - dominant-baseline
 * @param {string|function} options.textAnchor - text-anchor
 * @param {string} options.paintOrder - paint-order
 * @param {string} options.strokeLinecap - stroke-linecap
 * @param {string} options.strokeLinejoin - stroke-Linejoin
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let circles = geoviz.layer.label(main, { data: cities, text: "population", fontSize:20 })
 * @returns {SVGSVGElement|string} - the function adds a layer with labels to the SVG container and returns the layer identifier.
 */
export function label(
  svg,
  {
    id = unique(),
    projection,
    data,
    text,
    fill = "black",
    stroke = "none",
    fontSize = 14,
    fontFamily = svg.fontFamily,
    dx = 0,
    dy = 0,
    paintOrder = "stroke",
    strokeLinejoin = "round",
    strokeLinecap = "round",
    dominantBaseline = "central",
    textAnchor = "middle",
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg
        .append("g")
        .attr("id", id)
        .attr("class", zoomclass(svg.inset, projection))
        .attr("pointer-events", "none")
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Attr with specific default values
  layer
    .attr("paint-order", paintOrder)
    .attr("stroke-linejoin", strokeLinejoin)
    .attr("stroke-linecap", strokeLinecap)
    .attr("font-family", fontFamily);

  //...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: [
      "text",
      "fill",
      "stroke",
      "fontSize",
      "dx",
      "dy",
      "dominantBaseline",
      "textAnchor",
    ],
  });

  // Projection
  projection = projection == "none" ? (d) => d : svg.projection;

  layer
    .selectAll("text")
    .data(data.features.filter((d) => d.geometry.coordinates != undefined))
    .join("text")
    .attr("x", (d) => d3.geoPath(projection).centroid(d.geometry)[0])
    .attr("y", (d) => d3.geoPath(projection).centroid(d.geometry)[1])
    .attr("fill", fill)
    .attr("stroke", stroke)
    .attr("font-size", fontSize)
    .attr("dx", dx)
    .attr("dy", dy)
    .attr("dominant-baseline", dominantBaseline)
    .attr("text-anchor", textAnchor)
    .attr("visibility", (d) =>
      isNaN(d3.geoPath(svg.projection).centroid(d.geometry)[0])
        ? "hidden"
        : "visible"
    )
    .text(typeof text == "string" ? (d) => d.properties[text] : text);

  return `#${id}`;
}
