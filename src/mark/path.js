import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash } from "../helpers/camelcase";
import { tooltip } from "../helpers/tooltip";
import { mergeoptions } from "../helpers/mergeoptions";
import { propertiesentries } from "../helpers/propertiesentries";
import { addattr } from "../helpers/addattr";
import { random } from "../classify/random";
import { detectinput } from "../helpers/detectinput";
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

export function path(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer
    ? create({ zoomable: true, domain: arg1.data || arg1.datum })
    : arg1;
  // Arguments
  let opts = mergeoptions(
    {
      mark: "path",
      id: unique(),
      latlong: true,
      strokeWidth: 1,
      fill: "none",
      stroke: "none",
    },
    newcontainer ? arg1 : arg2
  );

  // ICI CA BUGGE
  if (opts.datum) {
    opts.fill = opts.fill
      ? opts.fill
      : implantation(opts.datum) == 2
      ? "none"
      : random();
    opts.stroke = opts.stroke
      ? opts.stroke
      : implantation(opts.datum) == 2
      ? random()
      : "none";
  }
  if (opts.data) {
    // opts.fill = implantation(opts.data) == 2 ? "none" : random();
    // opts.stroke = implantation(opts.data) == 2 ? random() : "white";
  }
  // ----------

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
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

  // Projection
  let projection = opts.latlong ? svg.projection : d3.geoIdentity();

  // Manage options
  let fields = propertiesentries(opts.data || opts.datum);
  let entries = Object.entries(opts).map((d) => d[0]);
  const notspecificattr = entries.filter(
    (d) =>
      !["mark", "id", "datum", "data", "latlong", "tip", "tipstyle"].includes(d)
  );
  const layerattr = notspecificattr.filter(
    (d) => detectinput(opts[d], fields) == "value"
  );

  const eltattr = notspecificattr.filter((d) => !layerattr.includes(d));

  // layer attributes
  layerattr.forEach((d) => {
    layer.attr(camelcasetodash(d), opts[d]);
  });

  // Draw each features with its attributes

  let path = d3.geoPath(projection);
  if (opts.datum) {
    layer.append("path").datum(opts.datum).attr("d", path);
  }
  if (opts.data) {
    layer
      .selectAll("path")
      .data(opts.data.features.filter((d) => d.geometry !== null))
      .join((d) => {
        let n = d.append("path").attr("d", path);
        eltattr.forEach((e) => {
          n.attr(camelcasetodash(e), opts[e]);
        });
        return n;
      });

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
