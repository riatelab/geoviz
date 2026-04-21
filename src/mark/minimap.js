import { create } from "../container/create";
import { camelcasetodash, unique } from "../helpers/utils";
import { subsetobj } from "../helpers/utils_legend.js";
import { location } from "../helpers/location.js";
import { land } from "../helpers/land.js";
import { select } from "d3-selection";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { select, geoPath });

/**
 * Create a minimap inset showing a basemap and a location geometry.
 *
 * @function minimap
 * @async
 * @property {Object} svg - SVG container (d3 selection) where the minimap is appended.
 * @property {string} [id] - Unique identifier of the minimap. Defaults to a generated id.
 * @property {Object} [basemap_data] - GeoJSON data used as basemap. Defaults to `land`.
 * @property {string} [basemap_fill="white"] - Fill color of the basemap.
 * @property {number} [basemap_fillOpacity=0.5] - Fill opacity of the basemap.
 * @property {string} [basemap_stroke="none"] - Stroke color of the basemap.
 * @property {number} [width=200] - Width of the minimap.
 * @property {string} [mark="minimap"] - Mark type identifier.
 * @property {string} [projection="EqualEarth"] - Projection used for the minimap.
 * @property {number} [precision=10] - Precision used for geometry simplification.
 * @property {Array<number>} [pos=[10, 10]] - Position of the minimap (top-left corner).
 * @property {string} [location_type="polygon"] - Type of location geometry ("polygon" or "point").
 * @property {number} [location_r=5] - Radius used when `location_type` is "point".
 * @property {string} [location_fill] - Fill color of the location geometry.
 * @property {string} [location_stroke] - Stroke color of the location geometry.
 * @property {number} [location_strokeWidth=1.2] - Stroke width of the location geometry.
 * @property {Object} [domain] - Optional projection domain.
 * @property {Object} [margin] - Margin configuration.
 * @property {Object} [outline_*] - Outline styling properties (prefixed with `outline_`).
 * @property {Object} [basemap_*] - Additional basemap styling properties (prefixed with `basemap_`).
 * @property {Object} [location_*] - Additional location styling properties (prefixed with `location_`).
 * @example
 * svg.minimap({
 *   width: 150,
 *   projection: "Mercator",
 *   pos: [20, 20],
 * }); // where svg is the container
 */
export async function minimap(arg1, arg2) {
  // Arguments by default
  const options = {
    id: unique(),
    basemap_data: land,
    basemap_fill: "white",
    basemap_fillOpacity: 0.5,
    basemap_stroke: "none",
    width: 200,
    mark: "minimap",
    projection: "EqualEarth",
    precision: 10,
    pos: [10, 10],
    location_strokeWidth: 1.2,
    location_type: "polygon",
    location_r: 5,
  };

  let opts = { ...options, ...arg2 };
  if (opts.location_type == "point") {
    opts.location_fill = opts.location_fill ?? "#1f1f1f";
    opts.location_stroke = opts.location_stroke ?? "none";
  } else {
    opts.location_fill = opts.location_fill ?? "none";
    opts.location_stroke = opts.location_stroke ?? "#1f1f1f";
  }

  let svg = arg1;

  let locationarea = location(svg, opts.precision, opts.location_type);

  svg.select(`#${opts.id}`).remove();

  let inset = create({
    id: opts.id,
    parent: svg,
    projection: opts.projection,
    pos: opts.pos,
    width: opts.width,
    coords: "geo",
    domain: opts.domain,
    margin: opts.margin,
  });

  // Outline
  const outlineStyles = Object.fromEntries(
    Object.entries(subsetobj(opts, { prefix: "outline_" })).map(
      ([key, value]) => [camelcasetodash(key), value],
    ),
  );
  inset.outline(outlineStyles);

  // Add basemap
  const basemapStyles = Object.fromEntries(
    Object.entries(subsetobj(opts, { prefix: "basemap_" })).map(
      ([key, value]) => [camelcasetodash(key), value],
    ),
  );
  inset.path({
    id: opts.id + "_basemap",
    datum: opts.basemap_data,
    fill: opts.basemap_fill,
    ...basemapStyles,
  });

  const locationStyles = Object.fromEntries(
    Object.entries(subsetobj(opts, { prefix: "location_" })).map(
      ([key, value]) => [camelcasetodash(key), value],
    ),
  );
  inset.path({
    id: opts.id + "_location",
    data: locationarea,
    ...locationStyles,
  });

  // Zoom;
  if (svg.zoomable) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      svg.zoomablelayers.push({
        id: opts.id,
        mark: "minimap",
        projection: inset.projection,
        precision: opts.precision,
        location_type: opts.location_type,
        location_r: opts.location_r,
      });
    }
  }

  // Render
  return `#${opts.id}`;
}
