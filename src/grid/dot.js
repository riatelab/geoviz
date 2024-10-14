import { range } from "d3-array";
const d3 = Object.assign({}, { range });

/**
 * @function grid/dot
 * @description The `grid.dot` function allows to create a geoJSON vith regular dots in SVG coordinates.
 * @see {@link https://observablehq.com/@neocartocnrs/regular-grids}
 * @property {number} [step = 50] - step of the grid
 * @property {number} [width = 1000] - width of the grid
 * @property {number} [height = 500] - height of the grid
 * @example
 * geoviz.grid.dot({step: 30})
 */
export function dot({ step = 30, width = 1000, height = 500 } = {}) {
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
        type: "Point",
        coordinates: d,
      },
      properties: {
        index: i,
      },
    };
  });
  return {
    type: "FeatureCollection",
    type: "dot",
    coords: "svg",
    features: result,
  };
}
