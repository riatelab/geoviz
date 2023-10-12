/**
 * This function allow to unproject geometries.
 *
 * @param {object} data - a GeoJSON FeatureCollection
 * @param {object} options - options and parameters
 * @param {function} options.projection - projection definition. See [d3-geo](https://github.com/d3/d3-geo) & [d3-geo-projection](https://github.com/d3/d3-geo-projection)
 * @example
 * let newGeoJSON = geoviz.transform.unproject(world, { projection: d3.geoOrthographic()})
 * @returns {object} - a GeoJSON FeatureCollection with wgs84 coordinates
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
