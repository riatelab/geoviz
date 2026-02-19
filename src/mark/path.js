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
 * @function path
 * @description The `path` function generates SVG paths from a geoJSON. The function adds a layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/path-mark}
 *
 * @property {object} data - GeoJSON FeatureCollection. Use data to be able to iterate
 * @property {object} datum - GeoJSON FeatureCollection. Use datum if you don't need to iterate.
 * @property {string} [id] - id of the layer
 * @property {string} [coords = "geo"] - use "svg" if the coordinates are already in the plan of the svg document
 * @property {boolean} [clip = true] - use true to clip the path with the outline
 * @property {string|function} [fill] - fill color. To create choropleth maps or typologies, use the `tool.choro` and `tool.typo` functions
 * @property {string|function} [stroke] - stroke color. To create choropleth maps or typologies, use the `tool.choro` and `tool.typo` functions
 * @property {string|function} [strokeWidth = 1] - stroke-width (default: 1)
 * @property {number} [pointRadius = 3] - point radius (default: 3). Only for point geometries
 * @property {boolean|function} [tip = false] - a function to display the tip. Use true tu display all fields
 * @property {boolean} [view] = false] - use true and viewof in Observable for this layer to act as Input
 * @property {object} [tipstyle] - tooltip style
 * @property {*} [*] - *other SVG attributes that can be applied (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @property {*} [svg_*]  - *parameters of the svg container created if the layer is not called inside a container (e.g svg_width)*
 * @example
 * // There are several ways to use this function
 * geoviz.path(svg, { data: world, fill: "red" }) // where svg is the container
 * svg.path({ data: world, fill: "red" }) // where svg is the container
 * svg.plot({ type: "path", data: world, fill: "red" }) // where svg is the container
 * geoviz.path({ data: world, fill: "red" }) // no container
 */

export function path(arg1, arg2) {
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
    mark: "path",
    id: unique(),
    coords: "geo",
    clip: true,
    strokeWidth: 1,
    clipPath: undefined,
    pointRadius: 3,
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // New container
  let svgopts = { domain: opts.data || opts.datum };
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(0, 4) == "svg_" ? d.slice(4) : d]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

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
  let layer = svg.select(`#${opts.id}`);
  if (layer.empty()) {
    let before = opts.before
      ? opts.before.startsWith("#")
        ? opts.before
        : `#${opts.before}`
      : null;
    let after = opts.after
      ? opts.after.startsWith("#")
        ? opts.after
        : `#${opts.after}`
      : null;

    if (before && svg.select(before).node()) {
      layer = svg
        .insert("g", before)
        .attr("id", opts.id)
        .attr("data-layer", "path");
    } else if (after && svg.select(after).node()) {
      const ref = svg.select(after).node();
      layer = svg.append("g").attr("id", opts.id).attr("data-layer", "path");
      ref.after(layer.node());
    } else {
      layer = svg.append("g").attr("id", opts.id).attr("data-layer", "path");
    }
  }
  layer.selectAll("*").remove();

  // zoomable layer
  if (svg.zoomable && !svg.parent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      //svg.zoomablelayers.push(opts);
      svg.zoomablelayers.push({
        mark: opts.mark,
        id: opts.id,
        coords: opts.coords,
        pointRadius: opts.pointRadius,
      });
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id),
      );
      //svg.zoomablelayers[i] = opts;
      svg.zoomablelayers[i] = {
        mark: opts.mark,
        id: opts.id,
        coords: opts.coords,
        pointRadius: opts.pointRadius,
      };
    }
  }

  // Projection
  let projection =
    opts.coords == "svg"
      ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
      : svg.projection;
  let path = d3.geoPath(projection).pointRadius(opts.pointRadius);

  // ClipPath
  if (opts.clipPath) {
    layer.attr("clip-path", opts.clipPath);
    opts.clip = false;
  }

  // Specific attributes
  let entries = Object.entries(opts).map((d) => d[0]);
  const notspecificattr = entries.filter(
    (d) =>
      ![
        "mark",
        "id",
        "datum",
        "data",
        "coords",
        "tip",
        "tipstyle",
        "clipPath",
      ].includes(d),
  );

  // layer attributes
  let fields = propertiesentries(opts.data || opts.datum);
  const layerattr = notspecificattr.filter(
    (d) => detectinput(opts[d], fields) == "value",
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
    if (opts.tip || opts.tipstyle || opts.view) {
      // console.log(opts.data);
      // console.log(fields);
      tooltip(
        layer,
        opts.data,
        svg,
        opts.tip,
        opts.tipstyle,
        fields,
        opts.view,
      );
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
