import { range, max } from "d3-array";
const d3 = Object.assign({}, { range, max });

/**
 * @function grid/hexbin
 * @description The `grid.hexbin` function allows to create a hexbin geoJSON grid in SVG coordinates.
 * @see {@link https://observablehq.com/@neocartocnrs/regular-grids}
 * @property {number} [step = 50] - step of the grid
 * @property {number} [width = 1000] - width of the grid
 * @property {number} [height = 500] - height of the grid
 * @example
 * geoviz.grid.hexbin(50, 1000, 500)
 */
export function hexbin(step = 50, width = 1000, height = 500) {
  let w = step;
  let size = w / Math.sqrt(3);
  let h = 2 * size * (3 / 4);

  // build grid
  let y = d3.range(0, height + size, h).reverse();
  if (y.length % 2) {
    y.unshift(d3.max(y) + h);
  }
  let x = d3.range(0, width + size, w);
  let grid = x.map((x) => y.map((y) => [x, y])).flat();
  grid = grid.map((d, i) => {
    return i % 2 == 1 ? [d[0] + w / 2, d[1]] : d;
  });
  let s = step / 2;
  // build object
  let result = grid.map((d, i) => {
    let hex = [];
    for (let i = 0; i < 6; i++) {
      let ang = (Math.PI / 180) * (60 * i - 30);
      hex.push([d[0] + size * Math.cos(ang), d[1] + size * Math.sin(ang)]);
    }

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[hex[0], hex[1], hex[2], hex[3], hex[4], hex[5], hex[0]]],
      },
      properties: {
        index: i,
      },
    };
  });
  return { type: "FeatureCollection", features: result };
}
