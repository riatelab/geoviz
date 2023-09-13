/**
 * `geotable` is a function to create an array on objects containing properties and geomeytries, froam a GeoJSON FeatureCollection.
 * This makes it easy to sort, extract data, etc. tool.featurecollection(geotable, { geometry: "geometry" }) can be used to rebuild a valid geoJSON.
 *
 * @param {object} data - A GeoJSON FeatureCollection
 * @param {object} options - options and parameters
 * @param {string} options.geometry - name of field containing GEOJSON geometries
 *
 * @returns {object} an array of  FeatureCollection
 */

export function geotable(data, { geometry = "geometry" } = {}) {
  let x = JSON.parse(JSON.stringify(data));
  let table = x.features.map((d) =>
    Object.assign(d.properties, { [geometry]: d.geometry })
  );
  return table;
}