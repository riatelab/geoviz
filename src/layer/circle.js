import { create } from "../container/create";
import { render } from "../container/render";
import { tooltip } from "../helpers/tooltip";
import { centroid } from "../transform/centroid";
import { zoomclass } from "../helpers/zoomclass";
import { addattr } from "../helpers/addattr";
import { random } from "../classify/random";
import { unique } from "../helpers/unique";
import { implantation } from "../helpers/implantation";
import { scaleSqrt } from "d3-scale";
import { max, descending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { scaleSqrt, max, descending, geoPath, geoIdentity }
);

/**
 * The `circle` function allows to create a layer with circles from a geoJSON (points)
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.data - GeoJSON FeatureCollection (points)
 * @param {string} options.id - id of the layer
 * @param {number|string} options.r - a number or the name of a property containing numerical values.
 * @param {number} options.k - radius of the largest circle (or corresponding to the value defined by `fixmax`)
 * @param {number} options.fixmax - value matching the circle with radius `k`. Setting this value is useful for making maps comparable with each other
 * @param {string|function} options.projection - use "none" if the coordinates are already in the plan of the page. If this field is left blank, the global container projection is applied.
 * @param {string|function} options.fill - fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} options.stroke - stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {boolean|function} options.tip - a function to display the tip. Use true tu display all fields
 * @param {object} options.tipstyle - tooltip style
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let circles = geoviz.layer.bubble(main, { data: cities, r: "population" })
 * @returns {SVGSVGElement|string} - the function adds a layer with circles to the SVG container and returns the layer identifier.
 */

export function circle(arg1, arg2) {
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
    r: 10,
    k: 50,
    fixmax: null,
    fill: random(),
    stroke: "white",
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
        .attr("class", zoomclass(svg.inset, opts.projection))
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // ...attr
  addattr({
    layer,
    args: options,
    exclude: ["fill", "stroke", "r"],
  });

  // Centroid
  opts.data = implantation(opts.data) == 3 ? centroid(opts.data) : opts.data;

  // Projection
  opts.projection =
    opts.projection == "none" ? d3.geoIdentity() : svg.projection;

  if (typeof opts.r == "string") {
    const valmax =
      opts.fixmax != undefined
        ? opts.fixmax
        : d3.max(opts.data.features, (d) => Math.abs(+d.properties[opts.r]));
    let radius = d3.scaleSqrt([0, valmax], [0, opts.k]);

    layer
      .selectAll("circle")
      .data(
        opts.data.features
          .filter((d) => d.geometry)
          .filter((d) => d.geometry.coordinates != undefined)
          .filter((d) => d.properties[opts.r] != undefined)
          .sort((a, b) =>
            d3.descending(
              Math.abs(+a.properties[opts.r]),
              Math.abs(+b.properties[opts.r])
            )
          )
      )
      .join("circle")
      .attr("cx", (d) => d3.geoPath(opts.projection).centroid(d.geometry)[0])
      .attr("cy", (d) => d3.geoPath(opts.projection).centroid(d.geometry)[1])
      .attr("r", (d) => radius(Math.abs(d.properties[opts.r])))
      .attr("fill", opts.fill)
      .attr("stroke", opts.stroke)
      .attr("visibility", (d) =>
        isNaN(d3.geoPath(opts.projection).centroid(d.geometry)[0])
          ? "hidden"
          : "visible"
      );
  }

  if (typeof opts.r == "number") {
    layer
      .selectAll("circle")
      .data(opts.data.features.filter((d) => d.geometry))
      .join("circle")
      .attr("cx", (d) => d3.geoPath(opts.projection).centroid(d.geometry)[0])
      .attr("cy", (d) => d3.geoPath(opts.projection).centroid(d.geometry)[1])
      .attr("r", opts.r)
      .attr("fill", opts.fill)
      .attr("stroke", opts.stroke)
      .attr("visibility", (d) =>
        isNaN(d3.geoPath(opts.projection).centroid(d.geometry)[0])
          ? "hidden"
          : "visible"
      );
  }

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
