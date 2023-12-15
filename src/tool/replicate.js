import { sum } from "d3-array";
const d3 = Object.assign({}, { sum });

/**
 * @description Data-driven features replication. This function can be used to create "dots cartograms"
 * @see {@link https://observablehq.com/@neocartocnrs/geoviz-dotscartogram }
 *
 * @param {object} data - a GeoJSON FeatureCollection
 * @param {object} arg - options and parameters
 * @param {string} arg.field - property name containing numeric data
 * @param {number} arg.targetvalue - Feature target value
 * @example
 * let dots = geoviz.tool.replicate(world, { field: "population", targetvalue: 10000 })
 * @returns {object} - a GeoJSON FeatureCollection with overlapping features
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
