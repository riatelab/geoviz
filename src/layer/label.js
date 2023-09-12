import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";

/**
 * The `label` function allows to create a label layer from a geoJSON (points)
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.data - GeoJSON FeatureCollection (points)
 * @param {string} options.id - id of the layer
 * @param {boolean} options.geocoords - use `true` if input coordinates are in latitude ans longitude. Use `false` if the coordinates are already defined in the page plan
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
    geocoords = true,
    data,
    text,
    fill = "black",
    stroke = "none",
    fontSize = 14,
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
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Attr with specific default values
  layer
    .attr("paint-order", paintOrder)
    .attr("stroke-linejoin", strokeLinejoin)
    .attr("stroke-linecap", strokeLinecap);

  //   if (typeof text == "string") {
  //     text = (d) => d.properties[text];
  //   }

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

  const projection = geocoords ? svg.projection : (d) => d;

  layer
    .selectAll("text")
    .data(data.features.filter((d) => d.geometry.coordinates != undefined))
    .join("text")
    .attr("x", (d) => projection(d.geometry.coordinates)[0])
    .attr("y", (d) => projection(d.geometry.coordinates)[1])
    .attr("fill", fill)
    .attr("stroke", stroke)
    .attr("font-size", fontSize)
    .attr("dx", dx)
    .attr("dy", dy)
    .attr("dominant-baseline", dominantBaseline)
    .attr("text-anchor", textAnchor)
    .text(typeof text == "string" ? (d) => d.properties[text] : text);

  return `#${id}`;
}
