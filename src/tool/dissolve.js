import { geoArea } from "d3-geo";
const d3 = Object.assign({}, { geoArea });

/**
 * @function tool/dissolve
 * @description The `tool.dissolve` function aims to transform multi part features into single parts feature. It a GeoJSON FeatureCollection (without multi part features)
 * @see {@link https://observablehq.com/@neocartocnrs/handle-geometries}
 *
 * @property {object} data - a GeoJSON FeatureCollection
 * @property {boolean} [options.areashare = "_share"] - name of the field containing the share area of the part
 * @example
 * let dots = geoviz.tool.dissolve(world)
 */
export function dissolve(geojson, options = { areashare: "_share" }) {
  geojson = JSON.parse(JSON.stringify(geojson));

  let result = [];
  geojson.features.forEach((d) => {
    result.push(sp(d, options.areashare));
  });

  const keys = Object.keys(geojson).filter((e) => e != "features");
  const obj = {};
  keys.forEach((d) => {
    obj[d] = geojson[d];
  });
  obj.features = result.flat();

  return obj;
}

function sp(feature, share) {
  let result = [];

  if (feature.geometry.type.includes("Multi")) {
    feature.geometry.coordinates.forEach((d) => {
      result.push({
        type: "Feature",
        properties: feature.properties,
        geometry: {
          type: feature.geometry.type.replace("Multi", ""),
          coordinates: d,
        },
      });
    });
  } else {
    result.push({ ...feature });
  }

  const totalArea = d3.geoArea(feature);
  result.forEach(
    (d) =>
      (d.properties = { ...d.properties, [share]: d3.geoArea(d) / totalArea })
  );

  return JSON.parse(JSON.stringify(result));
}
