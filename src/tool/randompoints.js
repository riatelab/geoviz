import bbox from "@turf/bbox";
import area from "@turf/area";
import bboxPolygon from "@turf/bbox-polygon";
import { randomPoint } from "@turf/random";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { sum } from "d3-array";

const d3 = Object.assign({}, { sum });

/**
 * @function tool/randompoints
 * @description
 * Generates random points inside polygons or multipolygons using a dot-density approach.
 * Each point is returned as a valid GeoJSON Feature with `properties` containing
 * `{ geom_id, data, var, id }`.
 *
 * @param {GeoJSON} data - FeatureCollection of polygons/multipolygons
 * @param {string} var - property name to convert into dots
 * @param {number} [dotval] - number of units per dot, default = total / 5000
 * @returns {GeoJSON} FeatureCollection<Point>
 */
export function randompoints({ data, var: varName, dotval } = {}) {
  if (!data || !data.features || !varName) {
    return { type: "FeatureCollection", features: [] };
  }

  const total = d3.sum(data.features, (d) =>
    Number(d.properties?.[varName] || 0),
  );
  dotval = dotval ?? Math.round(total / 5000);

  const points = [];
  let pointCounter = 0;

  data.features.forEach((feature, fIdx) => {
    const geomType = feature.geometry.type;
    const coords = feature.geometry.coordinates;
    const value = Number(feature.properties?.[varName] || 0);
    const totalDots = Math.round(value / dotval);
    const totalArea = area(feature) || 0;
    const geom_id = fIdx;

    // ---------- POLYGON ----------
    if (geomType === "Polygon") {
      const pts = dotsInPoly(feature, totalDots);
      pts.forEach((pt) => {
        points.push({
          type: "Feature",
          geometry: pt.geometry,
          properties: {
            geom_id,
            data: value,
            var: varName,
            id: pointCounter++,
          },
        });
      });
    }

    // ---------- MULTIPOLYGON ----------
    else if (geomType === "MultiPolygon") {
      // calcul surfaces des parties
      const parts = coords.map((c, i) => {
        const geom = { type: "Polygon", coordinates: c };
        const partArea = area({ type: "Feature", geometry: geom }) || 0;
        const ratio = totalArea ? partArea / totalArea : 0;
        return { geom, area: partArea, ratio, part_id: i };
      });

      // allocation des dots proportionnellement
      const exactDots = parts.map((p) => totalDots * p.ratio);
      const baseDots = exactDots.map(Math.floor);

      let remaining = totalDots - d3.sum(baseDots);
      const order = exactDots
        .map((v, i) => ({ i, r: v - baseDots[i] }))
        .sort((a, b) => b.r - a.r);

      for (let k = 0; k < remaining; k++) baseDots[order[k].i]++;

      // génération points pour chaque partie
      parts.forEach((p) => {
        if (baseDots[p.part_id] === 0) return;
        const pts = dotsInPoly(
          { type: "Feature", geometry: p.geom },
          baseDots[p.part_id],
        );
        pts.forEach((pt) => {
          points.push({
            type: "Feature",
            geometry: pt.geometry,
            properties: {
              geom_id: `${geom_id}_${p.part_id}`,
              data: value,
              var: varName,
              id: pointCounter++,
            },
          });
        });
      });
    }
  });

  return { type: "FeatureCollection", dotvalue: dotval, features: points };
}

function dotsInPoly(feature, nbdots) {
  const box = bbox(feature);
  const polyArea = area(feature);
  const bboxArea = area(bboxPolygon(box));
  const efficiency = polyArea / bboxArea;
  const maxIter = Math.ceil((nbdots / efficiency) * 1.2);

  const points = [];
  let attempts = 0;

  while (points.length < nbdots && attempts < maxIter) {
    const pt = randomPoint(1, { bbox: box }).features[0];
    if (booleanPointInPolygon(pt, feature)) points.push(pt);
    attempts++;
  }

  return points;
}
