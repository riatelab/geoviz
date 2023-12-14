import { whatisit } from "../helpers/whatisit";
import { coords2geo } from "../helpers/coords2geo";
import { bbox } from "../helpers/bbox";

/**
 * `featurecollection` is a function to create a valid GeoJSON FeatureCollection, from geometries, features or coordinates.
 *
 * @param {object|Array} data - A GeoJSON FeatureCollection, an array of GeoJSON features, a single feature, an array of geometries, a single geometry or a array defining a bbox. You can also use an array of properties containing latitude and longitude coordinates. In this case, you need to specify the field names in the options.
 * @param {object} options - options and parameters
 * @param {string} options.latitude - name of field containing latitudes. You can also use `lat`
 * @param {string} options.longitude - name of field containing longitudes. You can also use `lon`
 * @param {string} options.coordinates - name of field containing géographic coordinates. You can also use `coords`
 * @param {string} options.geometry - name of field containing GEOJSON geometries
 *
 * @returns {object} a GeoJSON FeatureCollection
 */

export function featurecollection(data, options = {}) {
  let x = JSON.parse(JSON.stringify(data));

  if (whatisit(x) == "table" && checkTable(options) == true) {
    console.log("table");
    return coords2geo(x, options);
  } else if (whatisit(x) == "table" && checkGeoTable(options) == true) {
    console.log("geotable");
    return geotabletogeojson(x, options);
  } else {
    switch (whatisit(x)) {
      case "FeatureCollection":
        return x;
        break;
      case "features":
        return { type: "FeatureCollection", features: x };
        break;
      case "feature":
        return { type: "FeatureCollection", features: [x] };
        break;
      case "geometries":
        return {
          type: "FeatureCollection",
          features: x.map((d) => ({
            type: "Feature",
            properties: {},
            geometry: d,
          })),
        };
        break;
      case "geometry":
        return {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: {},
              geometry: x,
            },
          ],
        };
        break;
      case "bbox":
        return bbox(x);
        break;
      default:
        return x;
    }
  }
}

function checkTable(options) {
  if (
    (options.lat && options.lon) ||
    (options.latitude && options.longitude) ||
    options.coords ||
    options.coordinates
  ) {
    return true;
  } else {
    return false;
  }
}

function checkGeoTable(options) {
  if (options.geom || options.geometry) {
    return true;
  } else {
    return false;
  }
}

function geotabletogeojson(geotable, { geometry = "geometry" } = {}) {
  let properties = JSON.parse(JSON.stringify(geotable));
  let geom = properties.map((d) => d[geometry]);
  properties.forEach((d) => delete d[geometry]);
  let features = properties.map((d, i) => ({
    type: "Feature",
    properties: d,
    geometry: geom[i],
  }));

  return { type: "FeatureCollection", features };
}
