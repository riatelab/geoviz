import { bbox } from "../helpers/bbox";
import { rewind } from "../tool/rewind";
import { booleanIntersects } from "@turf/boolean-intersects";
import { range, max } from "d3-array";
const d3 = Object.assign({}, { range, max });

export function trianglegeo(step = 1, domain = undefined) {
  let size = step / Math.sqrt(3);
  let h = (Math.sqrt(3) / 2) * step;

  let triangletop = (p, size) => {
    let h = (Math.sqrt(3) / 2) * size;
    let p1 = [p[0] + size / 2, p[1]];
    let p2 = [p[0], p[1] - h];
    let p3 = [p[0] - size / 2, p[1]];
    return [p1, p2, p3, p1];
  };

  let trianglebottom = (p, size) => {
    let h = (Math.sqrt(3) / 2) * size;
    let p1 = [p[0] + size / 2, p[1]];
    let p2 = [p[0], p[1] + h];
    let p3 = [p[0] - size / 2, p[1]];
    return [p1, p2, p3, p1];
  };

  let y = d3.range(-90 + h / 2, 90, h).reverse();
  if (y.length % 2) {
    y.unshift(d3.max(y) + h);
  }

  let x = d3.range(-180 + step / 2, 180, step);

  let grid = x.map((x) => y.map((y) => [x, y])).flat();
  grid = grid.map((d, i) => {
    return i % 2 == 1 ? [d[0] + step / 2, d[1]] : d;
  });

  let nb = grid.length;
  grid = grid.concat(grid);

  // build object
  let result = grid.map((d, i) => {
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates:
          i < nb ? [triangletop(d, step)] : [trianglebottom(d, step)],
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

  return rewind({ type: "FeatureCollection", features: final });
}
