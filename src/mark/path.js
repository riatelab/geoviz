import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoIdentity });
import { create } from "../container/create";
import { render } from "../container/render";
import { tooltip } from "../helpers/tooltip";
import { random } from "../tool/random";
import { max } from "d3-array";
import {
  camelcasetodash,
  unique,
  implantation,
  propertiesentries,
  detectinput,
  check,
  getsize,
} from "../helpers/utils";
import { simpl } from "../helpers/simpl";

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

export async function path(arg1, arg2) {
  // ---New container ?---
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;

  // --- Options ---
  const options = {
    mark: "path",
    id: unique(),
    coords: "geo",
    clip: true,
    strokeWidth: 1,
    clipPath: undefined,
    pointRadius: undefined,
    simplify: false,
    makevalid: false,
    zoom_levels: [1, 8],
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // --- Container ---
  let svgopts = { domain: opts.data || opts.datum };
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) === "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(4)]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

  if (opts.data || opts.datum) svg.data = true;

  // --- Preprocess simplify ---
  const dynamic_simplify =
    Array.isArray(opts.simplify) && opts.simplify.length === 2;

  const raw = opts.data || opts.datum;
  let dataset = raw;
  let base;

  if (dynamic_simplify) {
    // normaliser kmin et kmax
    const [kmin, kmax] = [
      Math.min(...opts.simplify),
      Math.max(...opts.simplify),
    ];
    opts._kmin = kmin;
    opts._kmax = kmax;

    console.log(opts);

    // simplification initiale = niveau le plus simplifié pour affichage par défaut
    dataset = await simpl(raw, { k: opts._kmin, tovalid: opts.makevalid });
    base = await simpl(raw, { k: opts._kmax, tovalid: opts.makevalid });
  } else if (opts.simplify) {
    dataset = await simpl(raw, { k: opts.simplify, tovalid: opts.makevalid });
  } else if (opts.makevalid) {
    dataset = await simpl(raw, { k: 1, tovalid: true });
  }

  // --- Colors ---
  const randomcol = random();

  if (dataset) {
    if (implantation(raw) === 2) {
      opts.fill = opts.fill ?? "none";
      opts.stroke = opts.stroke ?? randomcol;
    } else {
      const col = randomcol;
      opts.fill = opts.fill ?? col;
      opts.stroke = opts.stroke ?? (opts.datum ? col : "white");
      opts.strokeWidth = opts.strokeWidth ?? (opts.datum ? 0 : 1);
    }

    opts.pointRadius = opts.pointRadius ?? (implantation(raw) === 3 ? 0 : 3);
  }

  // --- Init layer ---
  let layer = svg.select(`#${opts.id}`);
  if (layer.empty()) {
    layer = svg.append("g").attr("id", opts.id).attr("data-layer", "path");
  }
  layer.selectAll("*").remove();

  // --- Zoomable layer ---
  if (svg.zoomable && !svg.parent) {
    const zoom_levels = Array.isArray(svg.zoomable)
      ? svg.zoomable
      : opts.zoom_levels;

    const layerObj = {
      mark: opts.mark,
      id: opts.id,
      coords: opts.coords,
      zoom_levels,
      pointRadius: opts.pointRadius,
      original_base: dataset,
      original_raw: raw,
      simplify: opts.simplify,
      makevalid: opts.makevalid,
      kmin: opts._kmin,
      kmax: opts._kmax,
    };

    const existingIndex = svg.zoomablelayers.map((d) => d.id).indexOf(opts.id);
    if (existingIndex === -1) svg.zoomablelayers.push(layerObj);
    else svg.zoomablelayers[existingIndex] = layerObj;
  }

  // --- Projection and geoPath ---
  let projection =
    opts.coords === "svg"
      ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
      : svg.projection;
  let pathFunc = d3.geoPath(projection).pointRadius(opts.pointRadius);

  // --- Clip-path ---
  if (opts.clipPath) {
    layer.attr("clip-path", opts.clipPath);
    opts.clip = false;
  }

  // --- Attributes ---
  const entries = Object.keys(opts);
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

  const fields = propertiesentries(dataset);
  const layerattr = notspecificattr.filter(
    (d) => detectinput(opts[d], fields) === "value",
  );
  layerattr.forEach((d) => layer.attr(camelcasetodash(d), opts[d]));

  const eltattr = notspecificattr.filter((d) => !layerattr.includes(d));
  eltattr.forEach((d) => (opts[d] = check(opts[d], fields)));

  // --- Clip-path of the sphere if needed ---
  if (opts.clip && opts.coords !== "svg" && svg.initproj !== "none") {
    const clipid = unique();
    if (svg.zoomable && !svg.parent)
      svg.zoomablelayers.push({ mark: "outline", id: clipid });
    svg
      .append("clipPath")
      .attr("id", clipid)
      .append("path")
      .attr("d", pathFunc({ type: "Sphere" }));
    layer.attr("clip-path", `url(#${clipid})`);
  }

  if (dataset) {
    layer
      .selectAll("path")
      .data(dataset.features.filter((d) => d.geometry !== null))
      .join((d) => {
        let n = d.append("path").attr("d", pathFunc);
        eltattr.forEach((e) => n.attr(camelcasetodash(e), opts[e]));
        return n;
      });

    if (opts.tip || opts.tipstyle || opts.view) {
      tooltip(layer, dataset, svg, opts.tip, opts.tipstyle, fields, opts.view);
    }
  }

  // --- Viewbox ---
  svg = Object.assign(svg, { viewbox: getsize(layer) });

  // --- Output ---
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
