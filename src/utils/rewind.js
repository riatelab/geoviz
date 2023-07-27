/**
 * Rewind a FeatureCollection counterclockwise and inner rings.
 * Adapted from MapBox geojson-rewind code (https://github.com/mapbox/grojson-rewind) under ISC license
 *
 * Example: {@link https://observablehq.com/@neocartocnrs/rewind?collection=@neocartocnrs/geotoolbox Observable notebook}
 *
 * @param {object} x - a FeatureCollection
 * @param {object} options - Optional parameters
 * @param {boolean} [options.outer=true] - Rewind Rings Outer
 * @param {boolean} [options.mutate=true] - Mutate the Input geoJSON
 * @returns {{features: {geometry: {}, type: string, properties: {}}[], type: string}} - The resulting GeoJSON FeatureCollection
 *
 */

export function rewind(x, options = {}) {
  let outer = options.outer === false ? false : true;
  let mutate = options.mutate === false ? false : true;
  let geo = mutate === true ? x : JSON.parse(JSON.stringify(x));
  for (let i = 0; i < geo.features.length; i++) {
    if (geo.features[i].geometry.type === "Polygon") {
      rewindRings(geo.features[i].geometry.coordinates, outer);
    } else if (geo.features[i].geometry.type === "MultiPolygon") {
      for (let j = 0; j < geo.features[i].geometry.coordinates.length; j++) {
        rewindRings(geo.features[i].geometry.coordinates[j], outer);
      }
    }
  }
  return geo;
}

function rewindRings(rings, outer) {
  if (rings.length === 0) return;
  rewindRing(rings[0], outer);
  for (let i = 1; i < rings.length; i++) {
    rewindRing(rings[i], !outer);
  }
}

function rewindRing(ring, dir) {
  let tArea = 0;
  let err = 0;
  for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
    const k = (ring[i][0] - ring[j][0]) * (ring[j][1] + ring[i][1]);
    const m = tArea + k;
    err += Math.abs(tArea) >= Math.abs(k) ? tArea - m + k : k - m + tArea;
    tArea = m;
  }
  if (tArea + err >= 0 !== !!dir) ring.reverse();
}
