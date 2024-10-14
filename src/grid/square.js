import { range } from "d3-array";
const d3 = Object.assign({}, { range });

/**
 * @function grid/square
 * @description The `grid.square` function allows to create a square geoJSON grid in SVG coordinates.
 * @see {@link https://observablehq.com/@neocartocnrs/regular-grids}
 * @property {number} [step = 50] - step of the grid
 * @property {number} [width = 1000] - width of the grid
 * @property {number} [height = 500] - height of the grid
 * @example
 * geoviz.grid.square({step: 30})
 */
export function square({ step = 50, width = 1000, height = 500 } = {}) {
  // build grid
  let y = d3.range(0 + step / 2, height, step).reverse();
  let x = d3.range(0 + step / 2, width, step);
  let grid = x.map((x) => y.map((y) => [x, y])).flat();

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
  return {
    type: "FeatureCollection",
    type: "square",
    coords: "svg",
    features: result,
  };
}
