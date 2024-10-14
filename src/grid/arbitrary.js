import { Delaunay } from "d3-delaunay";
const d3 = Object.assign({}, { Delaunay });

/**
 * @function grid/arbitrary
 * @description The `grid.arbitrary` function allows to create an arbitrary geoJSON grid in SVG coordinates.
 * @see {@link https://observablehq.com/@neocartocnrs/regular-grids}
 * @property {number} [step = 50] - step of the grid
 * @property {number} [width = 1000] - width of the grid
 * @property {number} [height = 500] - height of the grid
 * @example
 * geoviz.grid.arbitrary({step: 30})
 */

export function arbitrary({ step = 50, width = 1000, height = 500 } = {}) {
  let grid = [];
  let nb = Math.round((width / step) * (height / step));
  for (let i = 0; i < nb; i++) {
    grid.push([Math.random() * width, Math.random() * height]);
  }

  let voronoi = d3.Delaunay.from(
    grid,
    (d) => d[0],
    (d) => d[1]
  ).voronoi([0, 0, width, height]);

  // build object
  let result = grid.map((d, i) => {
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [voronoi.cellPolygon(i)],
      },
      properties: {
        index: i,
      },
    };
  });
  return {
    type: "FeatureCollection",
    type: "arbitrary",
    coords: "svg",
    features: result,
  };
}
