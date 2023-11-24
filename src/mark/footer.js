import { addattrprefix } from "../helpers/addattrprefix";
import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
import { mergeoptions } from "../helpers/mergeoptions";
import { getsize } from "../helpers/getsize";
import { create } from "../container/create";
import { render } from "../container/render";

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

export function footer(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;

  // Arguments
  let opts = mergeoptions(
    {
      mark: "footer",
      id: unique(),
      text: "Author, source...",
      rect_fill: "white",
      rect_fillOpacity: 0.5,
      fontSize: 10,
      dx: 0,
      dy: 0,
      fontFamily: undefined,
      lineSpacing: 0,
      textAnchor: "middle",
    },
    newcontainer ? arg1 : arg2
  );

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Height
  let startdy = opts.fontSize / 3;

  let tmp = layer
    .append("g")
    .attr("text-anchor", "middle")
    .attr("font-family", svg.fontFamily || opts.fontFamily)
    .attr("font-size", opts.fontSize);

  tmp
    .selectAll("text")
    .data(opts.text.split("\n"))
    .join("text")
    .attr("y", (d, i) => i * opts.fontSize + i * opts.lineSpacing)
    //.attr("dy", dy)
    .text((d) => d);
  let txt_height = getsize(tmp).height;
  tmp.remove();

  // Background
  let rect_h = txt_height + startdy + opts.dy * 4;
  let rect = layer
    .append("rect")
    .attr("x", 0)
    .attr("y", svg.height - rect_h)
    .attr("width", svg.width)
    .attr("height", rect_h)
    .attr("fill", opts.rect_fill)
    .attr("fill-opacity", opts.rect_fillOpacity);

  // ...attr
  addattrprefix({
    params: opts || {},
    layer: rect,
    prefix: "rect",
  });

  // text anchor
  let xpos;
  switch (opts.textAnchor) {
    case "start":
      xpos = opts.dx + startdy;
      break;
    case "middle":
      xpos = svg.width / 2 + opts.dx;
      break;
    case "end":
      xpos = svg.width - opts.dx - startdy;
      break;
  }

  let txt = layer
    .append("g")
    .attr("text-anchor", "middle")
    .attr("font-family", svg.fontFamily || opts.fontFamily)
    .attr("dominant-baseline", "hanging")
    .attr("font-size", opts.fontSize)
    .attr("fill", "#242323");

  txt
    .selectAll("text")
    .data(opts.text.split("\n"))
    .join("text")
    .attr("x", xpos)
    .attr(
      "y",
      (d, i) =>
        svg.height -
        rect_h +
        i * opts.fontSize +
        i * opts.lineSpacing +
        opts.dy +
        startdy
    )
    .attr("dy", opts.dy)
    .text((d) => d);

  // ...attr
  addattr({
    layer: txt,
    args: opts,
    exclude: [],
  });

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
