/**
 * @function tool/unproject
 * @description The `tool.unproject` function allow to unproject geometries. It returns a GeoJSON FeatureCollection with wgs84 coordinates
 * @see {@link https://observablehq.com/@neocartocnrs/handle-geometries}
 * @property {object} data - a GeoJSON FeatureCollection
 * @property {function} options.projection - projection definition. See [d3-geo](https://github.com/d3/d3-geo) & [d3-geo-projection](https://github.com/d3/d3-geo-projection)
 * @example
 * let newGeoJSON = geoviz.tool.unproject(world, { projection: d3.geoOrthographic()})
 */
export function unproject(geojson, options = {}) {
  let x = JSON.parse(JSON.stringify(geojson));
  x.features.forEach(
    (d) =>
      (d.geometry.coordinates = unprojectCoords(
        d.geometry.coordinates,
        options.projection
      ))
  );
  return x;
}

function unprojectCoords(coords, proj) {
  if (typeof coords[0] !== "object") return proj.invert(coords);
  return coords.map(function (coord) {
    return unprojectCoords(coord, proj);
  });
}
