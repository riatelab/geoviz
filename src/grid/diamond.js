import { range } from "d3-array";
const d3 = Object.assign({}, { range });

/**
 * @function grid/diamond
 * @description The `grid.diamond` function allows to create a diamond geoJSON grid in SVG coordinates.
 * @see {@link https://observablehq.com/@neocartocnrs/regular-grids}
 * @property {number} [step = 50] - step of the grid
 * @property {number} [width = 1000] - width of the grid
 * @property {number} [height = 500] - height of the grid
 * @example
 * geoviz.grid.diamond(50, 1000, 500)
 */
export function diamond(step = 50, width = 1000, height = 500) {
  let size = step * Math.sqrt(2);

  // build grid
  let x = d3.range(0, width + size, size);
  let y = d3.range(0, height + size, size / 2).reverse();
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
  return { type: "FeatureCollection", features: result };
}
