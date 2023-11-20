import { create } from "../container/create";
import { render } from "../container/render";
import { centroid } from "../transform/centroid";
import { implantation } from "../helpers/implantation";
import { tooltip } from "../helpers/tooltip";
import { addconst } from "../helpers/addconst";
import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";
import { scaleLinear } from "d3-scale";
import { max, descending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { scaleLinear, max, descending, geoPath, geoIdentity }
);

/**
 * The `spike` function allows to create a layer with spikes from a geoJSON (points)
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.data - GeoJSON FeatureCollection (points)
 * @param {string} options.id - id of the layer
 * @param {number|string} options.height - a number or the name of a property containing numerical values.
 * @param {number} options.width - width
 * @param {boolean} options.reverse - to flip the spikes
 * @param {number} options.k - height of the highest spike (or corresponding to the value defined by `fixmax`)
 * @param {number} options.fixmax - value matching the spikes with height `k`. Setting this value is useful for making maps comparable with each other
 * @param {string|function} options.projection - use "none" if the coordinates are already in the plan of the page. If this field is left blank, the global container projection is applied.
 * @param {string|function} options.fill - fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} options.stroke - stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {boolean|function} options.tip - a function to display the tip. Use true tu display all fields
 * @param {object} options.tipstyle - tooltip style
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let spikes = geoviz.layer.spike(main, { data: cities, height: "population" })
 * @returns {SVGSVGElement|string} - the function adds a layer with spikes to the SVG container and returns the layer identifier.
 */

export function spike(arg1, arg2) {
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
    height: undefined,
    width: 10,
    k: 50,
    fixmax: null,
    fill: "#c9225a",
    stroke: "none",
    reverse: false,
    tip: undefined,
    tipstyle: undefined,
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
        .attr("class", svg.inset ? "nozoom" : "zoomablespike")
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // ...attr
  addattr({
    layer,
    args: options,
    exclude: ["fill", "stroke"],
  });

  // Centroid
  opts.data = implantation(opts.data) !== 1 ? centroid(opts.data) : opts.data;

  // Projection
  let prj = opts.projection == "none" ? "none" : "svg";
  opts.projection =
    opts.projection == "none" ? d3.geoIdentity() : svg.projection;

  // String or number?
  let features =
    typeof height == "string"
      ? opts.data.features
      : addconst(opts.data.features, opts.height);
  opts.height = typeof opts.height == "string" ? opts.height : "___const";
  const valmax =
    opts.fixmax != undefined
      ? opts.fixmax
      : d3.max(features, (d) => Math.abs(+d.properties[opts.height]));
  const yScale =
    opts.height == "___const"
      ? (d) => d
      : d3.scaleLinear().domain([0, valmax]).range([0, opts.k]);

  let updown = opts.reverse ? -1 : 1;

  // layer data
  layer.attr(
    "data-layer",
    JSON.stringify({
      width: opts.width,
      height: opts.height,
      k: opts.k,
      fixmax: opts.fixmax,
      features,
      prj,
      updown,
    })
  );

  layer
    .selectAll("path")
    .data(
      features
        //.filter((d) => d.geometry)
        .filter((d) => d.properties[opts.height] != undefined)
        .sort((a, b) =>
          d3.descending(
            Math.abs(+a.properties[opts.height]),
            Math.abs(+b.properties[opts.height])
          )
        )
    )
    .join("path")
    .attr(
      "d",
      (d) =>
        `M ${
          d3.geoPath(opts.projection).centroid(d.geometry)[0] - opts.width / 2
        }, ${d3.geoPath(opts.projection).centroid(d.geometry)[1]} ${
          d3.geoPath(opts.projection).centroid(d.geometry)[0]
        }, ${
          d3.geoPath(opts.projection).centroid(d.geometry)[1] -
          yScale(d.properties[opts.height] * updown)
        } ${
          d3.geoPath(opts.projection).centroid(d.geometry)[0] + opts.width / 2
        }, ${d3.geoPath(opts.projection).centroid(d.geometry)[1]}`
    )
    .attr("fill", opts.fill)
    .attr("stroke", opts.stroke);

  if (opts.tip) {
    tooltip(layer, opts.data, svg, opts.tip, opts.tipstyle);
  }

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
