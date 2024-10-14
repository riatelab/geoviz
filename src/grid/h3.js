import {
  getRes0Cells,
  cellToChildren,
  isPentagon,
  cellToBoundary,
} from "h3-js";

/**
 * @function grid/h3
 * @description The `grid.h3` function allows to create a hexbin geoJSON grid in geographical coordinates.
 * @see {@link https://observablehq.com/@neocartocnrs/regular-grids}
 * @property {number} [level = 0] - level of the grid. Form 0 (large hexagons) to 4 (small hexagons). See:  https://h3geo.org
 * @example
 * geoviz.grid.h3(1)
 */
export function h3(level = 0) {
  return {
    type: "FeatureCollection",
    features: getRes0Cells()
      .map((i) => cellToChildren(i, level))
      .flat()
      .map((d) => ({
        type: "Feature",
        properties: { id: d, pentagon: isPentagon(d) },
        geometry: {
          type: "Polygon",
          coordinates: [cellToBoundary(d, true).reverse()],
        },
      })),
  };
}
