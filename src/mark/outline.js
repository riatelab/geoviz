import { geoPath } from "d3-geo";
import { addattr } from "../helpers/addattr";
import { mergeoptions } from "../helpers/mergeoptions";
import { unique } from "../helpers/unique";
import { create } from "../container/create";
import { render } from "../container/render";
const d3 = Object.assign({}, { geoPath });

/**
 * The `outline` function allows to create a layer with the limits of the earth area in the given projection
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id of the layer
 * @param {string} options.stroke - stroke color
 * @param {string} options.fill - fill color
 * @param {string} options.strokeWidth - stroke width
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let outline = geoviz.layer.outline(main, { fillOpacity: 0.5 })
 * @returns {SVGSVGElement|string} - the function adds a layer with the outline to the SVG container and returns the layer identifier.
 */
export function outline(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;

  // Arguments
  let opts = mergeoptions(
    {
      mark: "outline",
      id: unique(),
      fill: "#B5DFFD",
      stroke: "none",
      strokeWidth: 1,
    },
    newcontainer ? arg1 : arg2
  );

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg
        .append("g")
        .attr("id", opts.id)
        .attr("class", svg.inset ? "nozoom" : "zoomableoutline")
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // zoomable layer
  if (svg.zoomable && !svg.parent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      svg.zoomablelayers.push(opts);
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id)
      );
      svg.zoomablelayers[i] = opts;
    }
  }

  // Attr with specific default values
  layer
    .attr("fill", opts.fill)
    .attr("stroke", opts.stroke)
    .attr("stroke-width", opts.strokeWidth);

  // ...attr
  addattr({
    layer,
    args: opts,
    exclude: ["fill", "stroke", "strokeWidth"],
  });

  layer
    .append("path")
    .attr("d", d3.geoPath(svg.projection)({ type: "Sphere" }));

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
