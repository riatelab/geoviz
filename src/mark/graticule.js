import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash, unique } from "../helpers/utils";
import { geoGraticule, geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoGraticule });

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

  // Arguments
  const options = {
    mark: "graticule",
    id: unique(),
    step: 10,
    fill: "none",
    stroke: "#9ad5e6",
    strokeWidth: 0.8,
    strokeLinecap: "square",
    strokeLinejoin: "round",
    strokeDasharray: 2,
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // zoomable layer
  if (svg.zoomable && !svg.parent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      svg.zoomablelayers.push({
        mark: opts.mark,
        id: opts.id,
      });
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id)
      );
      svg.zoomablelayers[i] = {
        mark: opts.mark,
        id: opts.id,
      };
    }
  }

  // Manage options
  let entries = Object.entries(opts).map((d) => d[0]);
  const layerattr = entries.filter((d) => !["mark", "id", "step"].includes(d));

  // layer attributes
  layerattr.forEach((d) => {
    layer.attr(camelcasetodash(d), opts[d]);
  });

  // Draw graticules
  let path = d3.geoPath(svg.projection);
  layer
    .append("path")
    .datum(
      d3
        .geoGraticule()
        .step(Array.isArray(opts.step) ? opts.step : [opts.step, opts.step])
    )
    .attr("d", path);

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
