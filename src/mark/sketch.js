import { geoPath, geoNaturalEarth1, geoIdentity } from "d3-geo";
import { path } from "d3-path";
import { line, curveBasisClosed } from "d3-shape";
const d3 = Object.assign(
  {},
  { geoPath, geoIdentity, geoNaturalEarth1, path, line, curveBasisClosed },
);
import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash, unique } from "../helpers/utils";
import { simplify as simpl, aggregate } from "geotoolbox";

/**
 * @function sketch
 * @description The `sketch` function generates a hand-drawn (sketchy) SVG representation of GeoJSON geometries.
 * It applies SVG filters (`feTurbulence` and `feDisplacementMap`) to create a pencil-like effect.
 * The function adds a layer to the SVG container and returns the layer identifier.
 * If the container is not defined, then the layer is displayed directly.
 * @property {object} data - GeoJSON FeatureCollection. Use `data` or `datum` indifferently to provide the input geometry.
 * @property {string} [id] - id of the layer (auto-generated if not provided)
 * @property {string} [fill="none"] - fill color
 * @property {string} [stroke="#000"] - stroke color
 * @property {number} [strokeWidth=1] - stroke width
 * @property {number|number[]|false} [simplify] - geometry simplification (see `tool.simplify`)
 * @property {number} [baseFrequency=0.03] - base frequency of the turbulence filter (controls noise density)
 * @property {number} [feDisplacementMap=5] - displacement intensity of the sketch effect
 * @property {string} [fillStyle="dashed"] - fill style (reserved for future rough-like fills)
 * @property {number} [roughness=5] - roughness level (not fully implemented, reserved for future use)
 * @property {number} [hachureGap=3] - gap between hachure lines (reserved)
 * @property {number} [bowing=30] - line bowing effect (reserved)
 * @property {number} [fillWeight=0.12] - fill stroke weight (reserved)
 * @property {*} [*] - *other SVG attributes that can be applied (strokeDasharray, opacity, strokeLinecap, etc.)*
 * @property {*} [svg_*] - *parameters of the SVG container created if the layer is not called inside a container (e.g. svg_width, svg_height)*
 *
 * @example
 * // Basic usage
 * geoviz.sketch(svg, { data: world })
 *
 * // With styling
 * geoviz.sketch(svg, {
 *   data: world,
 *   stroke: "#333",
 *   strokeWidth: 1.5,
 *   baseFrequency: 0.02,
 *   feDisplacementMap: 8
 * })
 *
 * // Without container
 * geoviz.sketch({ data: world })
 *
 * // Using plot API
 * svg.plot({ type: "sketch", data: world })
 */

export function sketch(arg1, arg2) {
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
    simplify: undefined,
    mark: "sketch",
    id: unique(),
    fill: "none",
    stroke: "#000",
    strokeWidth: 1,
    baseFrequency: 0.03,
    feDisplacementMap: 5,
    fillStyle: "dashed",
    roughness: 5,
    hachureGap: 3,
    bowing: 30,
    fillWeight: 0.12,
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // New container
  //let svgopts = { projection: d3.geoNaturalEarth1() };
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

  // Defs

  let defs = svg.select("#defs");
  const pencil1 = defs.append("filter").attr("id", "pencil1_" + opts.id);
  pencil1.append("feTurbulence").attr("baseFrequency", opts.baseFrequency);
  pencil1
    .append("feDisplacementMap")
    .attr("in", "SourceGraphic")
    .attr("scale", opts.feDisplacementMap);
  const pencil2 = defs.append("filter").attr("id", "pencil2_" + opts.id);
  pencil2.append("feTurbulence").attr("baseFrequency", opts.baseFrequency * 2);
  pencil2
    .append("feDisplacementMap")
    .attr("in", "SourceGraphic")
    .attr("scale", opts.feDisplacementMap + 2);

  // Projection
  let projection = svg.projection;

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id).attr("data-layer", "outline")
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Zoom
  if (svg.zoomable && !svg.parent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      svg.zoomablelayers.push(opts);
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id),
      );
      svg.zoomablelayers[i] = opts;
    }
  }

  // Manage options
  let entries = Object.entries(opts).map((d) => d[0]);
  const layerattr = entries.filter((d) => !["mark", "id"].includes(d));

  // layer attributes
  layerattr.forEach((d) => {
    layer.attr(camelcasetodash(d), opts[d]);
  });

  // Sketch
  let data = opts.data || opts.datum;
  let land = aggregate(data);
  land = simpl(land, { k: opts.simplify, arcs: 500 });

  // Draw outline

  layer
    .append("path")
    .datum(land)
    .attr("filter", `url(#pencil1_${opts.id})`)
    .attr("d", geoCurvePath(d3.curveBasisClosed, projection));
  // .attr("fill", "none");

  layer
    .append("path")
    .datum(land)
    .attr("filter", `url(#pencil2_${opts.id})`)
    .attr("d", geoCurvePath(d3.curveBasisClosed, projection))
    .attr("fill", "none");

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}

// HELPERS

function curveContext(curve) {
  return {
    moveTo(x, y) {
      curve.lineStart();
      curve.point(x, y);
    },
    lineTo(x, y) {
      curve.point(x, y);
    },
    closePath() {
      curve.lineEnd();
    },
  };
}

function geoCurvePath(curve, projection, context) {
  return (object) => {
    const pathContext = context === undefined ? d3.path() : context;
    d3.geoPath(projection, curveContext(curve(pathContext)))(object);
    return context === undefined ? pathContext + "" : undefined;
  };
}
