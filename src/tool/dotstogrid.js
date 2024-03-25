// Imports
import { range, max } from "d3-array";
import { Delaunay } from "d3-delaunay";
import { geoProject } from "d3-geo-projection";
const d3 = Object.assign({}, { range, max, Delaunay, geoProject });
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

/**
 * @function tool/dotstogrid
 * @description `dotstogrid` is a function to create a regular grid in the SVG plan count the number of dots inside
 * @see {@link https://observablehq.com/@neocartocnrs/bees}
 * @property {object} svg - A geoviz SVG container
 * @property {string} [options.type = "hex"] - type of grid ("hex", "square", "triangle","random")
 * @property {number} [options.step = 50] - grid resolution (in pixels)
 * @property {geoJSON} [options.data = undefined] - dots to count in the grid
 * @property {string} [options.var = undefined] - field to sum
 * @example
 * geoviz.tool.dotstogrid(svg, {type:"triangle", step:30, data: dots, var: "mayvar"})
 */

export function dotstogrid(
  svg,
  options = {
    data,
    type,
    step,
    var: undefined,
  }
) {
  options.type = options.type ? options.type : "hex";
  options.step = options.step ? options.step : 50;

  let grid;

  switch (options.type) {
    case "hex":
    case "hexbin":
      grid = hexbin(options.step, svg.width, svg.height);
      break;
    case "square":
      grid = square(options.step, svg.width, svg.height);
      break;
    case "triangle":
      grid = triangle(options.step, svg.width, svg.height);
      break;
    case "random":
      grid = random(options.step, svg.width, svg.height);
      break;
    default:
      grid = hexbin(options.step, svg.width, svg.height);
  }

  if (options.data !== undefined) {
    // TODO improve this for faster calculation
    let data = d3.geoProject(options.data, svg.projection);
    const features = data.features.filter(
      (d) => d.geometry?.coordinates != undefined
    );

    let count = 0;
    let sum = 0;
    let result = [];
    grid.forEach((g) => {
      features.forEach((d) => {
        if (booleanPointInPolygon(d, g)) {
          count += 1;
          sum += d.properties[options.var];
        }
      });
      if (count > 0) {
        let prop = options.var
          ? { id: g.properties.index, count, sum }
          : { id: g.properties.index, count };

        result.push({
          type: "Feature",
          geometry: g.geometry,
          properties: prop,
        });
      }

      count = 0;
    });
    return { type: "FeatureCollection", features: result };
  } else {
    return { type: "FeatureCollection", features: grid };
  }
}

// Squares

function square(step, width, height) {
  // build grid
  let y = d3.range(0 + step / 2, height, step).reverse();
  let x = d3.range(0 + step / 2, width, step);
  let grid = x.map((x, i) => y.map((y) => [x, y])).flat();

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
  return result;
}

// Hexagons

function hexbin(step, width, height) {
  let w = step;
  let size = w / Math.sqrt(3);
  let h = 2 * size * (3 / 4);

  // build grid
  let y = d3.range(0, height + size, h).reverse();
  if (y.length % 2) {
    y.unshift(d3.max(y) + h);
  }
  let x = d3.range(0, width + size, w);
  let grid = x.map((x, i) => y.map((y) => [x, y])).flat();
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
  return result;
}

// Triangles

function triangle(step, width, height) {
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
  return result;
}

// Random

function random(step, width, height) {
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
  return result;
}
