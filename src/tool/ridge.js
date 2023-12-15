import { scaleLinear } from "d3-scale";
import { min, max, mean, mode } from "d3-array";
const d3 = Object.assign({}, { scaleLinear, min, max, mean, mode });

/**
 * @description Calculate the centroid of all the geometries given in a GeoJSON FeatureCollection
 * @see {@link https://observablehq.com/@neocartocnrs/ridge-lines}
 *
 * @param {array} grid - an arry of object containig x,y,z values
 * @param {object} arg - options and parameters
 * @param {string} arg.x - field containg x values
 * @param {string} arg.y - field containg y values
 * @param {string} arg.z - field containg z values
 * @param {number} arg.k - height of highest peak
 * @param {number} arg.fixmax - a fixed value corresponding to the k
 * @param {boolean} arg.projection - projection
 * @returns {object} - a GeoJSON FeatureCollection (LineString)
 */

export function ridge(
  grid,
  {
    x = "x",
    y = "y",
    z = "z",
    k = 100,
    fixmax = null,
    projection = (d) => d,
  } = {}
) {
  let res = getres(grid, x);
  let splitgrid = split(grid, res, { x, y, z, fixmax });

  //return splitgrid;

  return toLineString(splitgrid, res, {
    z,
    k,
    projection,
  });
}

function toLineString(
  splitedgrid,
  res,
  {
    x = "x",
    y = "y",
    z = "z",
    k = 100,
    fixmax = null,
    projection = (d) => d,
  } = {}
) {
  const valmax =
    fixmax != undefined ? fixmax : d3.max(splitedgrid.map((d) => d[0][z]));
  const yScale = d3.scaleLinear().domain([0, valmax]).range([0, k]);

  let features = [];
  splitedgrid.forEach((d, i) => {
    let values = d.map((d) => d[z]);
    let min = d3.min(values);
    let max = d3.max(values);
    let mean = d3.mean(values);
    let xmin = d[0][x] - res < -180 ? -180 : d[0][x] - res;
    let xmax = d[d.length - 1][x] + res > 180 ? 180 : d[d.length - 1][x] + res;
    d.unshift({ [x]: xmin, [y]: d[0][y], [z]: 0 });
    d.push({ [x]: xmax, [y]: d[0][y], [z]: 0 });

    features.push({
      type: "Feature",
      properties: {
        min,
        max,
        mean,
      },
      geometry: {
        type: "LineString",
        coordinates: d.map((e) => [
          projection([e[x], e[y]])[0],
          projection([e[x], e[y]])[1] - yScale(e[z]),
        ]),
      },
    });
  });

  return { type: "FeatureCollection", features };
}

function split(grid, res, { x = "x", y = "y", z = "z" } = {}) {
  // By line

  const ycoords = Array.from(new Set(grid.map((d) => d[y])));
  let all = [];
  ycoords.forEach((d) => {
    let line = grid.filter((e) => e[y] == d);

    let arr = [];
    let tmp = [];

    for (let i = 0; i < line.length - 1; i++) {
      tmp.push(line[i]);
      if (
        line[i + 1][x] - line[i][x] > res + res * 0.1 ||
        i == line.length - 2
      ) {
        arr.push(tmp);
        tmp = [];
      }
    }
    return all.push(arr);
  });

  let final = all.flat();

  return final;
}

function getres(grid, x) {
  let arr = [];
  for (let i = 0; i < grid.length - 1; i++) {
    arr.push(grid[i + 1][x] - grid[i][x]);
  }
  return d3.mode(arr);
}
