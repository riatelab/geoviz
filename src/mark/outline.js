import { geoPath, geoNaturalEarth1 } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoNaturalEarth1 });
import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash, unique } from "../helpers/utils";

/**
 * @function outline
 * @description The `outline` function allows to create a layer with Earth outline in the projection. The function adds a layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/layout-marks}
 *
 * @property {string} [id] - id of the layer
 * @property {string} [stroke = "none"] - stroke color
 * @property {number} [strokeWidth = 1] - stroke width
 * @property {string} [fill = "#B5DFFD"] - fill color
 * @property {*} [*] - *other attributes that can be used to define the svg style (strokeDasharray, opacity, strokeLinecap...)*
 * @property {*} [svg_*]  - *parameters of the svg container created if the layer is not called inside a container (e.g svg_width)*
 * @example
 * // There are several ways to use this function
 * geoviz.outline(svg, { fill: "yelllow" }) // where svg is the container
 * svg.outline({ fill: "yelllow" }) // where svg is the container
 * svg.plot({ type: "outline", fill: "yelllow" }) // where svg is the container
 * geoviz.outline({ fill: "yelllow" }) // no container
 */

export function outline(arg1, arg2) {
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
    mark: "outline",
    id: unique(),
    fill: "#B5DFFD",
    stroke: "none",
    strokeWidth: 1,
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
    svg.warning_message.push(`Outline mark`);
    svg.warning_message.push(
      `You must define a projection function in the SVG container`
    );
  }

  if (svg.initproj != "none") {
    // init layer
    let layer = svg.selectAll(`#${opts.id}`).empty()
      ? svg.append("g").attr("id", opts.id).attr("data-layer", "outline")
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
    const layerattr = entries.filter((d) => !["mark", "id"].includes(d));

    // layer attributes
    layerattr.forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });

    // Draw outline
    let path = d3.geoPath(svg.projection);
    layer.append("path").attr("d", path({ type: "Sphere" }));
    // Output
    if (newcontainer) {
      return render(svg);
    } else {
      return `#${opts.id}`;
    }
  }
}
