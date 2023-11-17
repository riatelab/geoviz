import { geoGraticule, geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoGraticule });
import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
import { zoomclass } from "../helpers/zoomclass";
import { create } from "../container/create";
import { render } from "../container/render";

/**
 * The `graticule` function allows to create a layer with lat/long lines
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id of the layer
 * @param {number|number[]} options.step - gap between graticules. The value can be a number or an array of two values
 * @param {string} options.stroke - stroke color
 * @param {string} options.fill - fill color
 * @param {string} options.strokeWidth - stroke width
 * @param {string} options.strokeLinecap - stroke-inecap
 * @param {string} options.strokeLinejoin - stroke-Linejoin
 * @param {string} options.strokeDasharray - stroke-dasharray
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let graticule = geoviz.layer.graticule(main, { step: 2 })
 * @returns {SVGSVGElement|string} - the function adds a layer with graticule lines to the SVG container and returns the layer identifier.
 */

export function graticule(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;
  let options = newcontainer ? arg1 : arg2;

  // Default values
  let opts = {
    id: unique(),
    step: 10,
    stroke: "#9ad5e6",
    strokeWidth: 0.8,
    strokeLinecap: "square",
    strokeLinejoin: "round",
    strokeDasharray: 2,
  };

  Object.keys(opts).forEach((d) => {
    if (options[d] !== undefined) {
      opts[d] = options[d];
    }
  });

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id).attr("class", zoomclass(svg.inset))
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Attr with specific default values
  layer
    .attr("fill", "none")
    .attr("stroke", opts.stroke)
    .attr("stroke-width", opts.strokeWidth)
    .attr("stroke-linecap", opts.strokeLinecap)
    .attr("stroke-linejoin", opts.strokeLinejoin)
    .attr("stroke-dasharray", opts.strokeDasharray);

  //...attr
  addattr({
    layer,
    args: options,
    exclude: [],
  });

  layer
    .append("path")
    .datum(
      d3
        .geoGraticule()
        .step(Array.isArray(opts.step) ? opts.step : [opts.step, opts.step])
    )
    .attr("d", d3.geoPath(svg.projection));

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
