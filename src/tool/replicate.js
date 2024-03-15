import { sum } from "d3-array";
const d3 = Object.assign({}, { sum });

/**
 * @function tool/replicate
 * @description Data-driven features replication. This function can be used to create "dots cartograms". The function returns a GeoJSON FeatureCollection with overlapping features
 * @see {@link https://observablehq.com/@neocartocnrs/geoviz-dotscartogram }
 * @property {object} data - a GeoJSON FeatureCollection
 * @property {string} options.field - property name containing numeric data
 * @property {number} options.targetvalue - Feature target value
 * @example
 * let dots = geoviz.tool.replicate(world, { field: "population", targetvalue: 10000 })
 */

export function replicate(data, { field, targetvalue } = {}) {
  let x = JSON.parse(JSON.stringify(data));

  targetvalue = targetvalue
    ? targetvalue
    : d3.sum(x.features.map((d) => parseFloat(d.properties[field]))) / 2000;

  let output = [];
  for (let i = 0; i <= x.features.length - 1; i++) {
    let nb = Math.round(+x.features[i].properties[field] / targetvalue);
    for (let j = 1; j <= nb; j++) {
      output.push({ ...x.features[i] });
    }
  }
  x.features = output;
  return x;
}
