import { addattrprefix } from "../helpers/addattrprefix";
import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
import { getsize } from "../helpers/getsize";

/**
 * The `footer` function allows to add a notes and sources at the bottom of the map
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id of the layer
 * @param {string} options.text - wtitle of the map
 * @param {string} options.fontFamily - font-family
 * @param {number} options.fontSize - font-size
 * @param {string} options.textAnchor - Position of the text ("start", "middle","end")
 * @param {number} options.lineSpacing - a positive number to increase spacing. A negative number to reduce it.
 * @param {number} options.dx - translate in x
 * @param {number} options.dy - translate in y
 * @param {*} options.foo - *other attributes that can be used to define the svg style of the text (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @param {string} options.rect_fill - color background
 * @param {string} options.rect_fillOpacity - background opacity
 * @param {*} options.rect_foo - *other attributes that can be used to define the svg style of the background *
 * @param {number|number[]} options.step - gap between graticules. The value can be a number or an array of two values
 * @param {string} options.stroke - stroke color
 * @param {string} options.fill - fill color
 * @param {string} options.strokeWidth - stroke width
 * @param {string} options.strokeLinecap - stroke-inecap
 * @param {string} options.strokeLinejoin - stroke-Linejoin
 * @param {string} options.strokeDasharray - stroke-dasharray
 * @example
 * let title = geoviz.layer.header(main, { text: "World population", rect_fill: "black" })
 * @returns {SVGSVGElement|string} - the function adds a layer with the title to the SVG container and returns the layer identifier.
 */

export function footer(
  svg,
  {
    id = unique(),
    text = "Author, source...",
    rect_fill = "white",
    rect_fillOpacity = 0.5,
    fontSize = 10,
    dx = 0,
    dy = 0,
    fontFamily,
    lineSpacing = 0,
    textAnchor = "middle",
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Height
  let startdy = fontSize / 3;

  let tmp = layer
    .append("g")
    .attr("text-anchor", "middle")
    .attr("font-family", svg.fontFamily || fontFamily)
    .attr("font-size", fontSize);

  tmp
    .selectAll("text")
    .data(text.split("\n"))
    .join("text")
    .attr("y", (d, i) => i * fontSize + i * lineSpacing)
    //.attr("dy", dy)
    .text((d) => d);
  let txt_height = getsize(tmp).height;
  tmp.remove();

  // Background
  let rect_h = txt_height + startdy + dy * 4;
  let rect = layer
    .append("rect")
    .attr("x", 0)
    .attr("y", svg.height - rect_h)
    .attr("width", svg.width)
    .attr("height", rect_h)
    .attr("fill", rect_fill)
    .attr("fill-opacity", rect_fillOpacity);

  // ...attr
  addattrprefix({
    params: arguments[1] || {},
    layer: rect,
    prefix: "rect",
  });

  // text anchor
  let xpos;
  switch (textAnchor) {
    case "start":
      xpos = dx + startdy;
      break;
    case "middle":
      xpos = svg.width / 2 + dx;
      break;
    case "end":
      xpos = svg.width - dx - startdy;
      break;
  }

  let txt = layer
    .append("g")
    .attr("text-anchor", "middle")
    .attr("font-family", svg.fontFamily || fontFamily)
    .attr("dominant-baseline", "hanging")
    .attr("font-size", fontSize)
    .attr("fill", "#242323");

  txt
    .selectAll("text")
    .data(text.split("\n"))
    .join("text")
    .attr("x", xpos)
    .attr(
      "y",
      (d, i) =>
        svg.height - rect_h + i * fontSize + i * lineSpacing + dy + startdy
    )
    .attr("dy", dy)
    .text((d) => d);

  // ...attr
  addattr({
    layer: txt,
    args: arguments[1],
    exclude: [],
  });

  return `#${id}`;
}
