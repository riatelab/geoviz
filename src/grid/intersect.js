import { featureCollection } from "@turf/helpers";
import { intersect } from "@turf/intersect";
import { geoPath } from "d3-geo";
import { groups } from "d3-array";
const d3 = Object.assign({}, { geoPath, groups });

/**
 * @function grid/intersect
 * @description The `grid.intersect` function allows to affect polygons values tu grid cells.
 * @see {@link https://observablehq.com/@neocartocnrs/regular-grids}
 * @property {object} [grid] - grid geoJSON
 * @property {object} [polygons] - polygons geoJSON
 * @property {string} [var = undefined] - field (absolute quantitative data only)
 */

// WARNING : BUG !!!!!!
export function intersectpolys(
  opts = {
    grid: undefined, // a FeatureCollection containg points
    polygons: undefined, // a FeatureCollection containg polygons (grid)
    var: undefined, // a field
  }
) {
  let grid = opts.grid.features;
  let polys = opts.polygons.features;
  let gridbyindex = new Map(grid.map((d, i) => [i, d]));

  let arr = [];
  polys.forEach((p, i) => {
    const area = d3.geoPath().area(p);
    grid.forEach((g, j) => {
      const f = intersect(featureCollection([p, g]));
      if (f !== null) {
        let areapiece = d3.geoPath().area(f);
        arr.push([i, j, areapiece / area]);
      }
    });
  });

  let accessor;
  if (opts.var) {
    accessor = new Map(
      polys.map((d, i) => [i, parseFloat(d.properties[opts.var]) || 0])
    );
  } else {
    accessor = new Map(polys.map((d, i) => [i, 1]));
  }

  let datagrid = d3.groups(arr, (d) => d[1]);

  function getsum(cell) {
    let sum = 0;
    cell[1].forEach((d) => {
      sum += accessor.get(d[0]) * d[2];
    });
    return sum == 0 ? undefined : sum;
  }

  return {
    type: "FeatureCollection",
    features: datagrid.map((d) => {
      let tmp = gridbyindex.get(d[0]);
      return {
        type: tmp.type,
        properties: { ...tmp.properties, sum: getsum(d) },
        geometry: tmp.geometry,
      };
    }),
  };
}
