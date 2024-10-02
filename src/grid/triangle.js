import { range, max } from "d3-array";
const d3 = Object.assign({}, { range, max });

export function triangle(step = 50, width = 1000, height = 500) {
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

  let size = step / Math.sqrt(3);
  let h = (Math.sqrt(3) / 2) * step;

  // build grid

  let y = d3.range(0, height + size, h).reverse();
  if (y.length % 2) {
    y.unshift(d3.max(y) + h);
  }
  let x = d3.range(0, width + size, step);
  let grid = x.map((x, i) => y.map((y) => [x, y])).flat();
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
  return { type: "FeatureCollection", features: result };
}
