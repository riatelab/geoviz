// Imports
import { geoArea, geoCentroid, geoIdentity, geoPath } from "d3-geo";
import { featurecollection } from "./featurecollection";
const d3 = Object.assign({}, { geoArea, geoCentroid, geoIdentity, geoPath });

/**
 * @function tool/centroid
 * @description The `tool.centroid` function calculate the centroid of all the geometries given in a GeoJSON FeatureCollection. It returns a GeoJSON FeatureCollection (points)
 * @see {@link https://observablehq.com/@neocartocnrs/handle-geometries}
 * @property {object} data - a GeoJSON FeatureCollection
 * @property {boolean} [options.largest = true] - place the centroid in the largest polygon.
 * @property {boolean} [options.latlong = true] - use `true` if input coordinates are in latitude ans longitude. Use `false` if the coordinates are already defined in the page plan
 * @example
 * let dots = geoviz.tool.centroid(world, { largest: true })
 */
export function centroid(data, { largest = true, latlong = true } = {}) {
  let path = d3.geoPath(d3.geoIdentity());

  let geojson = JSON.parse(JSON.stringify(data));
  geojson = featurecollection(
    geojson.features.filter((d) => d.geometry.coordinates !== undefined)
  );
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
