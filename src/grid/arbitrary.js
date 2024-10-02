import { Delaunay } from "d3-delaunay";
const d3 = Object.assign({}, { Delaunay });

export function arbitrary(step = 50, width = 1000, height = 500) {
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
  return { type: "FeatureCollection", features: result };
}
