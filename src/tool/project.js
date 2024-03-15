import { geoProject } from "d3-geo-projection";
const d3 = Object.assign({}, { geoProject });

/**
 * @function tool/project
 * @description The function `tool.project` use geoproject from d3-geo-projection to project a geoJSON. It returns a GeoJSON FeatureCollection with coordinates in the page map.
 * @see {@link https://observablehq.com/@neocartocnrs/handle-geometries}
 * @property {object} data - a GeoJSON FeatureCollection
 * @property {function} options.projection - projection definition. See [d3-geo](https://github.com/d3/d3-geo) & [d3-geo-projection](https://github.com/d3/d3-geo-projection)
 * @example
 * let newGeoJSON = geoviz.tool.project(world, { projection: d3.geoOrthographic()})
 */
export function project(data, { projection = null } = {}) {
  return projection == null ? data : d3.geoProject(data, projection);
}
