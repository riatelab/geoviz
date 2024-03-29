/**
 * @function tool/geotable
 * @description `geotable` is a function to create an array on objects containing properties and geomeytries, froam a GeoJSON FeatureCollection. This makes it easy to sort, extract data, etc. tool.featurecollection(geotable, { geometry: "geometry" }) can be used to rebuild a valid geoJSON. The function returns an array of an array of FeatureCollections.
 * @see {@link https://observablehq.com/@neocartocnrs/handle-geometries}
 * @property {object} data - A GeoJSON FeatureCollection
 * @property {string} options.geometry - name of field containing GEOJSON geometries
 */

export function geotable(data, { geometry = "geometry" } = {}) {
  let x = JSON.parse(JSON.stringify(data));
  let table = x.features.map((d) =>
    Object.assign(d.properties, { [geometry]: d.geometry })
  );
  return table;
}
