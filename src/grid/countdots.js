import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

export function countdots(
  opts = {
    dots: undefined, // a FeatureCollection containg points
    polygons: undefined, // a FeatureCollection containg polygons (grid)
    var: undefined, // a field  (optional)
  }
) {
  let polys = opts.polygons.features;
  let dots = opts.dots.features;
  let count = new Array(polys.length).fill(0);
  let nb = dots.length;
  let test = new Array(nb).fill(true);
  polys.forEach((p, i) => {
    dots.forEach((d, j) => {
      if (test[j]) {
        if (booleanPointInPolygon(d, p)) {
          if (opts.var == undefined) {
            count[i] = count[i] + 1;
          } else {
            count[i] = count[i] + parseFloat(d.properties[opts.var]);
          }
          test[j] = false;
        }
      }
    });
  });

  // Rebuild grid
  let output = polys
    .map((d, i) => ({
      type: d.type,
      geometry: d.geometry,
      properties: { ...d.properties, count: count[i] },
    }))
    .filter((d) => d.properties.count !== 0);

  //const endTime = performance.now();
  //const elapsedTime = endTime - startTime;
  return { type: "FeatureCollection", features: output };
}
