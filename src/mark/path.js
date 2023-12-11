import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoIdentity });
import { create } from "../container/create";
import { render } from "../container/render";
import { tooltip } from "../helpers/tooltip";
import { random } from "../tool/random";
import {
  camelcasetodash,
  unique,
  implantation,
  propertiesentries,
  detectinput,
  check,
  getsize,
} from "../helpers/utils";

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
  const options = {
    mark: "path",
    id: unique(),
    latlong: true,
    strokeWidth: 1,
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // Default color
  const randomcol = random();
  if (opts.data) {
    if (implantation(opts.data) == 2) {
      opts.fill = opts.fill ? opts.fill : "none";
      opts.stroke = opts.stroke ? opts.stroke : randomcol;
    } else {
      opts.fill = opts.fill ? opts.fill : randomcol;
      opts.stroke = opts.stroke ? opts.stroke : "white";
    }
  }

  if (opts.datum) {
    if (implantation(opts.datum) == 2) {
      opts.fill = opts.fill ? opts.fill : "none";
      opts.stroke = opts.stroke ? opts.stroke : randomcol;
    } else {
      opts.fill = opts.fill ? opts.fill : randomcol;
      opts.stroke = opts.stroke ? opts.stroke : "none";
    }
  }

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // zoomable layer
  if (svg.zoomable && !svg.parent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      //svg.zoomablelayers.push(opts);
      svg.zoomablelayers.push({
        mark: opts.mark,
        id: opts.id,
        latlong: opts.latlong,
      });
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id)
      );
      //svg.zoomablelayers[i] = opts;
      svg.zoomablelayers[i] = {
        mark: opts.mark,
        id: opts.id,
        latlong: opts.latlong,
      };
    }
  }

  // Projection
  let projection = opts.latlong ? svg.projection : d3.geoIdentity();

  // Specific attributes
  let entries = Object.entries(opts).map((d) => d[0]);
  const notspecificattr = entries.filter(
    (d) =>
      !["mark", "id", "datum", "data", "latlong", "tip", "tipstyle"].includes(d)
  );

  // layer attributes
  let fields = propertiesentries(opts.data || opts.datum);
  const layerattr = notspecificattr.filter(
    (d) => detectinput(opts[d], fields) == "value"
  );
  layerattr.forEach((d) => {
    layer.attr(camelcasetodash(d), opts[d]);
  });

  // features attributes (iterate on)
  const eltattr = notspecificattr.filter((d) => !layerattr.includes(d));
  eltattr.forEach((d) => {
    opts[d] = check(opts[d], fields);
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
      tooltip(layer, opts.data, svg, opts.tip, opts.tipstyle, fields);
    }
  }

  console.log(svg.projection);
  // Output
  if (newcontainer) {
    const size = getsize(layer);
    svg
      .attr("width", size.width)
      .attr("height", size.height)
      .attr("viewBox", [size.x, size.y, size.width, size.height]);
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
