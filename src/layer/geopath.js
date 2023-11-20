import { create } from "../container/create";
import { render } from "../container/render";
import { tooltip } from "../helpers/tooltip";
import { zoomclass } from "../helpers/zoomclass";
import { addattr } from "../helpers/addattr";
import { random } from "../classify/random";
import { implantation } from "../helpers/implantation";
import { unique } from "../helpers/unique";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoIdentity });

/**
 * The `geopath` function generates SVG paths from a geoJSON
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.data - GeoJSON FeatureCollection. Use data to be able to iterate
 * @param {object} options.datum - GeoJSON FeatureCollection. Use datum if you don't need to iterate.
 * @param {string} options.id - id of the layer
 * @param {string|function} options.projection - use "none" if the coordinates are already in the plan of the page. If this field is left blank, the global container projection is applied.
 * @param {string|function} options.fill - fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} options.stroke - stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} options.strokeWidth - stroke-width
 * @param {boolean|function} options.tip - a function to display the tip. Use true tu display all fields
 * @param {object} options.tipstyle - tooltip style
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let circles = geoviz.layer.geopath(main, { data: world, fill: "red" })
 * @returns {SVGSVGElement|string} - the function adds a layer with SVG paths to the SVG container and returns the layer identifier.
 */

export function geopath(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create({ zoomable: true }) : arg1;
  let options = newcontainer ? arg1 : arg2;

  // Default values
  let opts = {
    id: unique(),
    projection: undefined,
    data: undefined,
    datum: undefined,
    tip: undefined,
    tipstyle: undefined,
    fill: undefined,
    stroke: undefined,
    strokeWidth: 1,
  };

  Object.keys(opts).forEach((d) => {
    if (options[d] !== undefined) {
      opts[d] = options[d];
    }
  });

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg
        .append("g")
        .attr("id", opts.id)
        .attr("class", zoomclass(svg.inset, opts.projection))
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Projection
  opts.projection =
    opts.projection == "none" ? d3.geoIdentity() : svg.projection;

  // DATUM -----------------------------------------
  if (opts.datum) {
    // Colors by default
    if (!opts.fill) {
      opts.fill = implantation(opts.datum) == 2 ? "none" : random();
    }
    if (!opts.stroke) {
      opts.stroke = implantation(opts.datum) == 2 ? random() : "none";
    }

    // ...attr
    addattr({
      layer,
      args: options,
      exclude: ["fill", "stroke"],
    });

    layer
      .append("path")
      .datum(opts.datum)
      .attr("d", d3.geoPath(opts.projection))
      .attr("fill", opts.fill)
      .attr("stroke", opts.stroke)
      .attr("vector-effect", "non-scaling-stroke");
  }

  // DATA -----------------------------------------
  if (opts.data) {
    // Colors by default
    if (!opts.fill) {
      opts.fill = implantation(opts.data) == 2 ? "none" : random();
    }
    if (!opts.stroke) {
      opts.stroke = implantation(opts.data) == 2 ? random() : "white";
    }
    // ...attr
    addattr({
      layer,
      args: options,
      exclude: ["fill", "stroke"],
    });

    layer
      .selectAll("path")
      .data(opts.data.features.filter((d) => d.geometry !== null))
      .join("path")
      .attr("d", d3.geoPath(opts.projection))
      .attr("fill", opts.fill)
      .attr("stroke", opts.stroke)
      .attr("stroke-width", opts.strokeWidth);

    // Tooltip
    if (opts.tip) {
      tooltip(layer, opts.data, svg, opts.tip, opts.tipstyle);
    }
  }

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
