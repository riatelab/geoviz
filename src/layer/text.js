import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";

/**
 * The `text` function allows to create a layer with a text somewhere on the map
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id of the layer
 * @param {string} options.text - text to display. Backticks are allowed for multiple line writing
 * @param {number[]} options.pos - position [x,y] on the page
 * @param {string} options.stroke - stroke color
 * @param {string} options.fill - fill color
 * @param {string} options.strokeWidth - stroke width
 * @param {string} options.fontSize - font size
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let outline = geoviz.layer.outline(main, { fillOpacity: 0.5 })
 * @returns {SVGSVGElement|string} - the function adds a layer with the outline to the SVG container and returns the layer identifier.
 */
export function text(
  svg,
  {
    text = "My text here",
    pos = [10, 10],
    id = unique(),
    fill = "red",
    fontSize = 15,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Attr with specific default values
  layer
    .attr("font-size", `${fontSize}px`)
    .attr("fill", fill)
    .attr("font-family", svg.fontFamily || fontFamily);

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fontSize", "fill"],
  });

  layer
    .selectAll("text")
    .data(text.split("\n"))
    .join("text")
    .attr("x", pos[0])
    .attr("y", pos[1])
    .attr("dy", (d, i) => i * fontSize)
    .text((d) => d);

  return `#${id}`;
}
