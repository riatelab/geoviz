import { bbox } from "../helpers/bbox";
import { booleanIntersects } from "@turf/boolean-intersects";
import { range } from "d3-array";
const d3 = Object.assign({}, { range });

export function squaregeo(step = 1, domain = undefined) {
  let y = d3.range(-90 + step / 2, 90, step).reverse();
  let x = d3.range(-180 + step / 2, 180, step);
  let grid = x.map((x, i) => y.map((y) => [x, y])).flat();

  let s = step / 2;
  // build object
  let result = grid.map((d, i) => {
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [d[0] - s, d[1] + s],
            [d[0] + s, d[1] + s],
            [d[0] + s, d[1] - s],
            [d[0] - s, d[1] - s],
            [d[0] - s, d[1] + s],
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
