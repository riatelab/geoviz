import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash, unique } from "../helpers/utils";
import { geoGraticule, geoPath, geoNaturalEarth1 } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoGraticule, geoNaturalEarth1 });

/**
 * @function graticule
 * @description The `graticule` function allows to create a layer with lat/long lines. The function adds a layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/layout-marks}
 *
 * @property {string} [id] - id of the layer
 * @property {number|number[]} [step = 10] - gap between graticules. The value can be a number or an array of two values
 * @property {string} [stroke = "#9ad5e6"] - stroke color
 * @property {string} [fill = "none"] - fill color
 * @property {string} [strokeWidth = 0.8] - stroke width
 * @property {string} [strokeLinecap = "square"] - stroke-inecap
 * @property {string} [strokeLinejoin = "round"] - stroke-Linejoin
 * @property {number|number[]} [strokeDasharray = 2] - stroke-dasharray (default: 2)
 * @property {*} [*] - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @property {*} [svg_*]  - *parameters of the svg container created if the layer is not called inside a container (e.g svg_width)*
 * @example
 * // There are several ways to use this function
 * geoviz.graticule(svg, { step: 2 }) // where svg is the container
 * svg.graticule({ step: [10,2] }) // where svg is the container
 * svg.plot({ type: "graticule", step: [10,2] }) // where svg is the container
 * geoviz.graticule({ step: 2 }) // no container
 * @returns {SVGSVGElement|string} - the function adds a layer with graticule lines to the SVG container and returns the layer identifier.  If the container is not defined, then the layer is displayed directly.
 */

export function graticule(arg1, arg2) {
  console.log(arguments.length);

  // Test if new container
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;

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
    //svg_projection: d3.geoNaturalEarth1(),
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // New container
  let svgopts = { projection: d3.geoNaturalEarth1() };
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(0, 4) == "svg_" ? d.slice(4) : d]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

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
