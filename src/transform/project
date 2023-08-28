import { geoProject } from "d3-geo-projection";
const d3 = Object.assign({}, { geoProject });
export function project(data, { projection = null } = {}) {
  return projection == null ? data : d3.geoProject(data, projection);
}
