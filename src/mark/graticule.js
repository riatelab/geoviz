import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash, unique } from "../helpers/utils";
import { geoGraticule, geoPath, geoNaturalEarth1 } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoGraticule, geoNaturalEarth1 });

/**
 * @description The `graticule` function allows to create a layer with lat/long lines
 * @see {@link https://observablehq.com/@neocartocnrs/layout-marks}
 *
 * @param {SVGSVGElement} arg1 - SVG container (optional)
 * @param {object} arg2 - options and parameters
 * @param {string} arg2.id - id of the layer
 * @param {number|number[]} arg2.step - gap between graticules. The value can be a number or an array of two values (default: 10)
 * @param {string} arg2.stroke - stroke color (default: "#9ad5e6")
 * @param {string} arg2.fill - fill color (default: "none")
 * @param {string} arg2.strokeWidth - stroke width (default: 0.8)
 * @param {string} arg2.strokeLinecap - stroke-inecap (default: "square")
 * @param {string} arg2.strokeLinejoin - stroke-Linejoin (default: "round")
 * @param {number|number[]} arg2.strokeDasharray - stroke-dasharray (default: 2)
 * @param {*} arg2.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * geoviz.graticule(svg, { step: 2 }) // where svg is the container
 * svg.graticule({ step: [10,2] }) // where svg is the container
 * geoviz.graticule({ step: 2 }) // no container
 * @returns {SVGSVGElement|string} - the function adds a layer with graticule lines to the SVG container and returns the layer identifier.  If the container is not defined, then the layer is displayed directly.
 */

export function graticule(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create({ projection: d3.geoNaturalEarth1() }) : arg1;

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

  // Warning
  if (svg.initproj == "none" && svg.warning) {
    svg.warning_message.push(
      `You must define a projection function in the SVG container`
    );
  }

  if (svg.initproj != "none") {
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
    const layerattr = entries.filter(
      (d) => !["mark", "id", "step"].includes(d)
    );

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
}
