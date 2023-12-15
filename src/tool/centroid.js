// Imports
import { geoArea, geoCentroid, geoIdentity, geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoArea, geoCentroid, geoIdentity, geoPath });

/**
 * @description Calculate the centroid of all the geometries given in a GeoJSON FeatureCollection
 * @see {@link https://observablehq.com/@neocartocnrs/handle-geometries}
 *
 * @param {object} data - a GeoJSON FeatureCollection
 * @param {object} arg - options and parameters
 * @param {boolean} arg.largest - place the centroid in the largest polygon.
 * @param {boolean} arg.latlong - use `true` if input coordinates are in latitude ans longitude. Use `false` if the coordinates are already defined in the page plan
 * @example
 * let dots = geoviz.tool.centroid(world, { largest: true })
 * @returns {object} - a GeoJSON FeatureCollection (points)
 */
export function centroid(data, { largest = true, latlong = true } = {}) {
  let path = d3.geoPath(d3.geoIdentity());

  let geojson = JSON.parse(JSON.stringify(data));
  const largestPolygon = function (d) {
    var best = {};
    var bestArea = 0;
    d.geometry.coordinates.forEach(function (coords) {
      var poly = { type: "Polygon", coordinates: coords };
      var area = latlong ? d3.geoArea(poly) : path.area(poly);
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
      if (latlong) {
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
