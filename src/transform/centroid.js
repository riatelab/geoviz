// Imports

import { geoArea, geoCentroid, geoIdentity, geoPath } from "d3-geo";

const d3 = Object.assign({}, { geoArea, geoCentroid, geoIdentity, geoPath });

/**
 * Calculate the centroid of all the geometries given in a GeoJSON FeatureCollection
 *
 * @param {object} data - A GeoJSON FeatureCollection
 * @param {object} param1 - Options
 * @param {boolean} param1.largest - Place the centroid in the largest polygon.
 * @param {boolean} param1.geocoords - Use `true` if input coordinates are in latitude ans longitude. Use `false` if the coordinates are already defined in the page plan
 * @example
 * let dots = transform.centroid(world, { largest: true })
 * @returns {object} - A GeoJSON FeatureCollection (points)
 */
export function centroid(data, { largest = true, geocoords = true } = {}) {
  let path = d3.geoPath(d3.geoIdentity());

  let geojson = JSON.parse(JSON.stringify(data));
  const largestPolygon = function (d) {
    var best = {};
    var bestArea = 0;
    d.geometry.coordinates.forEach(function (coords) {
      var poly = { type: "Polygon", coordinates: coords };
      var area = geocoords ? d3.geoArea(poly) : path.area(poly);
      if (area > bestArea) {
        bestArea = area;
        best = poly;
      }
    });
    return best;
  };

  let centers = geojson.features
    .filter((d) => d.geometry != null)
    .map((d) => {
      if (geocoords) {
        d.geometry.coordinates = d3.geoCentroid(
          largest == true
            ? d.geometry.type == "Polygon"
              ? d
              : largestPolygon(d)
            : d
        );
      } else {
        d.geometry.coordinates = path.centroid(
          largest == true
            ? d.geometry.type == "Polygon"
              ? d
              : largestPolygon(d)
            : d
        );
      }

      d.geometry.type = "Point";
      return d;
    });

  geojson.features = centers;

  return geojson;
}
