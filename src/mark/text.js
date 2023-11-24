import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
import { mergeoptions } from "../helpers/mergeoptions";
import { create } from "../container/create";
import { render } from "../container/render";

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
export function text(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;

  // Arguments
  let opts = mergeoptions(
    {
      mark: "text",
      text: "My text here",
      pos: [10, 10],
      id: unique(),
      fill: "red",
      fontSize: 15,
    },
    newcontainer ? arg1 : arg2
  );

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Attr with specific default values
  layer
    .attr("font-size", `${opts.fontSize}px`)
    .attr("fill", opts.fill)
    .attr("font-family", svg.fontFamily || opts.fontFamily);

  // ...attr
  addattr({
    layer,
    args: opts,
    exclude: ["fontSize", "fill"],
  });

  layer
    .selectAll("text")
    .data(opts.text.split("\n"))
    .join("text")
    .attr("x", opts.pos[0])
    .attr("y", opts.pos[1])
    .attr("dy", (d, i) => i * opts.fontSize)
    .text((d) => d);

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
