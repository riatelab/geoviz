import { range } from "d3-array";
const d3 = Object.assign({}, { range });
import { booleanIntersects } from "@turf/boolean-intersects";
import { project } from "../tool/project.js";
import { bbox } from "../helpers/bbox";

export function dotgeo(step = 5, domain = undefined, projection = undefined) {
  // build grid
  let x = d3.range(-180 + step / 2, 180, step);
  let y = d3.range(-90 + step / 2, 90, step).reverse();
  let grid = x.map((x) => y.map((y) => [x, y])).flat();
  let s = step / 2;
  // build object
  let result = grid.map((d, i) => {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: d,
      },
      properties: {
        index: i,
      },
    };
  });

  if (domain == undefined) {
    return { type: "FeatureCollection", features: result };
  } else {
    let final = [];
    let resultproj = project(
      { type: "FeatureCollection", features: result },
      { projection: projection }
    ).features.filter((d) => d.geometry !== null);
    let bb = project(bbox(domain), { projection: projection });
    resultproj.forEach((d) => {
      if (booleanIntersects(d, bb.features[0])) {
        final.push(d.properties.index);
      }
    });
    return {
      type: "FeatureCollection",
      features: result.filter((d) => final.includes(d.properties.index)),
    };
  }
}
