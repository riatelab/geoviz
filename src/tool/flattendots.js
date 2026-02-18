/**
 * Converts a GeoJSON FeatureCollection of Points into a flat array of projected points for visualization.
 *
 * Each feature is projected using the provided `projection` function.
 * If `variable` is specified, points are replicated proportionally to the property value,
 * optionally normalized by `nb` to limit the total number of points.
 *
 * This function is intended for use in creating smoothed maps, such as isoband or density maps.
 *
 * @param {Object} options - Function options
 * @param {Object} options.data - GeoJSON FeatureCollection (Point features)
 * @param {string} [options.var] - Name of the property to replicate points by (optional)
 * @param {number} [options.nb=100000] - Maximum total number of points after replication
 * @param {function} options.projection - Projection function `[lon, lat] -> [x, y]`
 *
 * @returns {Array<Array<number>>} - Flattened array of projected points `[x, y]`, ready for plotting.
 *                                   Points are repeated according to their value if `variable` is provided.
 *
 * @example
 * const dots = flattenPointFeatures({
 *   data: *a geojson*,
 *   var: "population",
 *   nb: 50000,
 *   projection: d3.geoMercator()
 * });
 */

import { sum } from "d3-array";

export function flattendots({
  data,
  var: variable,
  nb = 100000,
  projection,
} = {}) {
  console.log("flattendots");
  let dots;
  if (variable == undefined) {
    dots = data.features
      .map((d) => [...projection(d.geometry.coordinates), 1])
      .filter((row) =>
        row.every((val) => val !== undefined && !Number.isNaN(val)),
      )
      .map((d) => [d[0], d[1]]);
  } else {
    dots = data.features
      .map((d) => [
        ...projection(d.geometry.coordinates),
        Number(d.properties?.[variable]),
      ])
      .filter((row) =>
        row.every((val) => val !== undefined && !Number.isNaN(val)),
      );
    const total = sum(dots.map((d) => d[2]));
    const target = nb == null ? total : Math.min(nb, total);
    const ratio = target / total;
    dots = dots.map((d) => [d[0], d[1], Math.round(d[2] * ratio)]);
    dots = dots.flatMap(([x, y, n]) => Array.from({ length: n }, () => [x, y]));
  }
  return dots;
}
