import { bbox } from "../helpers/bbox";
import { booleanIntersects } from "@turf/boolean-intersects";
import { range } from "d3-array";
const d3 = Object.assign({}, { range });

export function diamondgeo(step, domain) {
  let size = step * Math.sqrt(2);

  // build grid
  let y = d3.range(-90 + size / 2, 90, size / 2).reverse();
  let x = d3.range(-180 + size / 2, 180, size);
  let grid = x.map((x) => y.map((y, j) => [x, y, j % 2])).flat();
  grid = grid.map((d) => {
    return d[2] == 1 ? [d[0] + size / 2, d[1]] : [d[0], d[1]];
  });

  let s = size / 2;
  // build object
  let result = grid.map((d, i) => {
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [d[0] - s, d[1]],
            [d[0], d[1] + s],
            [d[0] + s, d[1]],
            [d[0], d[1] - s],
            [d[0] - s, d[1]],
          ],
        ],
      },
      properties: {
        index: i,
      },
    };
  });
  let final = [];

  if (domain) {
    let bb = bbox(domain);
    result.forEach((d) => {
      if (booleanIntersects(d, bb.features[0])) {
        final.push(d);
      }
    });
  } else {
    final = result;
  }

  return { type: "FeatureCollection", features: final };
}
