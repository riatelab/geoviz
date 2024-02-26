import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoIdentity });
import { create } from "../container/create";
import { render } from "../container/render";
import { tooltip } from "../helpers/tooltip";
import { viewof } from "../helpers/viewof";
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
 * @description The `path` function generates SVG paths from a geoJSON
 * @see {@link https://observablehq.com/@neocartocnrs/path-mark}
 *
 * @param {SVGSVGElement} arg1 - SVG container (optional)
 * @param {object} arg2 - options and parameters
 * @param {object} arg2.data - GeoJSON FeatureCollection. Use data to be able to iterate
 * @param {object} arg2.datum - GeoJSON FeatureCollection. Use datum if you don't need to iterate.
 * @param {string} arg2.id - id of the layer
 * @param {string} arg2.coords - use "svg" if the coordinates are already in the plan of the svg document (default: "geo")))
 * @param {boolean} arg2.clip - use true to clip the path with the outline (default; true)
 * @param {string|function} arg2.fill - fill color. To create choropleth maps or typologies, use the `tool.choro` and `tool.typo` functions
 * @param {string|function} arg2.stroke - stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} arg2.strokeWidth - stroke-width (default: 1)
 * @param {boolean|function} arg2.tip - a function to display the tip. Use true tu display all fields
 * @param {boolean} arg2.view - use true and viewof in Observable for this layer to act as Input
 * @param {object} arg2.tipstyle - tooltip style
 * @param {*} arg2.foo - *other SVG attributes that can be applied (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * geoviz.path(svg, { data: world, fill: "red" }) // where svg is the container
 * svg.path({ data: world, fill: "red" }) // where svg is the container
 * geoviz.path({ data: world, fill: "red" }) // no container
 * @returns {SVGSVGElement|string} - the function adds a layer with SVG paths to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 */

export function path(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer
    ? create({
        zoomable: true,
        control: false,
        projection: "none",
        domain: arg1.data || arg1.datum,
      })
    : arg1;

  // Arguments
  const options = {
    mark: "path",
    id: unique(),
    coords: "geo",
    clip: true,
    strokeWidth: 1,
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  if (opts.data || opts.datum) {
    svg.data = true;
  }

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
        coords: opts.coords,
      });
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id)
      );
      //svg.zoomablelayers[i] = opts;
      svg.zoomablelayers[i] = {
        mark: opts.mark,
        id: opts.id,
        coords: opts.coords,
      };
    }
  }

  // Projection
  let projection =
    opts.coords == "svg"
      ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
      : svg.projection;
  let path = d3.geoPath(projection);

  // Specific attributes
  let entries = Object.entries(opts).map((d) => d[0]);
  const notspecificattr = entries.filter(
    (d) =>
      !["mark", "id", "datum", "data", "coords", "tip", "tipstyle"].includes(d)
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

  // Clip-path
  if (opts.clip == true && opts.coords != "svg" && svg.initproj !== "none") {
    const clipid = unique();

    if (svg.zoomable && !svg.parent) {
      svg.zoomablelayers.push({ mark: "outline", id: clipid });
    }

    svg
      .append("clipPath")
      .attr("id", clipid)
      .append("path")
      .attr("d", path({ type: "Sphere" }));

    layer.attr("clip-path", `url(#${clipid})`);
  }

  // Draw each features with its attributes

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

    // Tooltip & view
    if (opts.tip) {
      tooltip(
        layer,
        opts.data,
        svg,
        opts.tip,
        opts.tipstyle,
        fields,
        opts.view
      );
    }
    if (!opts.tip && opts.view) {
      viewof(layer, svg);
    }
  }

  // viewbox
  svg = Object.assign(svg, { viewbox: getsize(layer) });

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
