import { columns } from "../helpers/utils";

/**
 * @function tool/merge
 * @description `tool.merge` is a function to join a geoJSON and a data file. It returns a GeoJSON FeatureCollection.
 * @see {@link https://observablehq.com/@neocartocnrs/handle-geometries}
 *
 * @property {Array} geom - a GeoJSON FeatureCollection
 * @property {string} geom_id - geom id
 * @property {Array} data - array containg data
 * @property {string} data_id - data id
 * @property {string} [id] - id (if ids are the same in data and geometries)
 */

export function merge({ geom, geom_id, data, data_id, id } = {}) {
  if (id) {
    geom_id = id;
    data_id = id;
  }

  // Join

  geom = JSON.parse(JSON.stringify(geom));
  let tmp = addUnderscore(
    data,
    geom.features.map((d) => d.properties),
    data_id
  );
  data = tmp[0];
  data_id = tmp[1];

  let accessor = new Map(data.map((d) => [d[data_id], d]));

  let features = [];
  geom.features.forEach((d) => {
    let obj = {};
    Object.keys(d).forEach((e) => {
      if (e == "properties") {
        Object.assign(obj, {
          properties: Object.assign(
            { ...d.properties },
            { ...accessor.get(d.properties[geom_id]) }
          ),
        });
      } else {
        Object.assign(obj, { [e]: d[e] });
      }
    });
    features.push(obj);
  });

  let featureCollection = {};
  Object.keys(geom).forEach((d) => {
    featureCollection = Object.assign(featureCollection, {
      [d]: d == "features" ? features : geom[d],
    });
  });

  // diagnostic

  let ids_geom = geom.features.map((d) => d.properties[geom_id]);
  let ids_data = data.map((d) => d[data_id]);
  let duplicate_geom = ids_geom.length - new Set(ids_geom).size;
  let duplicate_data = ids_data.length - new Set(ids_data).size;
  let intersection = ids_geom.filter((x) => ids_data.includes(x));
  let matched = intersection.filter((x) => ids_data.includes(x));
  let unmatched_geom = ids_geom.filter((x) => !ids_data.includes(x));
  let unmatched_data = ids_data.filter((x) => !ids_geom.includes(x));
  let diagnostic = {
    duplicate_data,
    duplicate_geom,
    geom: ids_geom,
    data: ids_data,
    matched,
    unmatched_geom,
    unmatched_data,
  };

  return { featureCollection, diagnostic };
}

function addUnderscore(data1, data2, id) {
  let arr1 = columns(data1);
  let arr2 = columns(data2);

  let output = [...arr1];
  while (output.filter((x) => arr2.includes(x)).length !== 0) {
    output
      .filter((x) => arr2.includes(x))
      .forEach((d) => {
        output[output.indexOf(d)] = "_" + d;
      });
  }

  let accessor = new Map(
    arr1.map((d, i) => {
      return [d, output[i]];
    })
  );

  let newArray = [];
  data1.forEach((d) => {
    let obj = {};
    Object.keys(d).forEach((e) => {
      obj[accessor.get(e)] = d[e];
    });
    newArray.push(obj);
  });

  return [newArray, accessor.get(id)];
}
