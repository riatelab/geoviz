import bbox from "@turf/bbox";
import area from "@turf/area";
import bboxPolygon from "@turf/bbox-polygon";
import randomPoint from "@turf/random-point";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

/**
 * @function tool/polygonstorandompoints
 * @description
 * Generates random points inside polygons or multipolygons using a dot-density approach.
 * Each point is returned in the format `{ geom, geom_id, data, data_id, id }`.
 *
 * @property {GeoJSON} geom - the polygon feature (or part of multipolygon) containing the point
 * @property {string|number} geom_id - identifier of the geometry
 * @property {number} data - value associated to the polygon property
 * @property {string} data_id - name of the property used
 * @property {number} id - unique point id
 *
 * @param {Array} geom - GeoJSON FeatureCollection of polygons/multipolygons
 * @param {string} data_id - property name to convert into dots
 * @param {number} [dotval] - number of units per dot, default = total / 5000
 * @returns {Object} FeatureCollection of points in the `{ geom, geom_id, data, data_id, id }` format
 */
export function polygonstorandompoints({ geom, data_id, dotval } = {}) {
  if (!geom || !geom.features || !data_id)
    return { featureCollection: { type: "FeatureCollection", features: [] } };

  const total = d3.sum(geom.features, (d) =>
    Number(d.properties?.[data_id] || 0),
  );
  dotval = dotval ?? Math.round(total / 5000);

  let points = [];
  let pointCounter = 0;

  geom.features.forEach((feature, fIdx) => {
    const geomType = feature.geometry.type;
    const coords = feature.geometry.coordinates;
    const value = Number(feature.properties?.[data_id] || 0);
    const totalDots = Math.round(value / dotval);

    const totalArea = area(feature) || 0;
    const geom_id = fIdx;

    // ---------- POLYGON ----------
    if (geomType === "Polygon") {
      const pts = allocate(feature, totalDots);
      pts.forEach((p) => {
        points.push({
          geom: p.geometry,
          geom_id,
          data: value,
          data_id,
          id: pointCounter++,
        });
      });
    }

    // ---------- MULTIPOLYGON ----------
    else if (geomType === "MultiPolygon") {
      const parts = coords.map((c, i) => {
        const geom = { type: "Polygon", coordinates: c };
        const partArea = area({ type: "Feature", geometry: geom }) || 0;
        const ratio = totalArea ? partArea / totalArea : 0;
        return { geom, area: partArea, ratio, part_id: i };
      });

      const exactDots = parts.map((p) => totalDots * p.ratio);
      const baseDots = exactDots.map(Math.floor);

      let remaining = totalDots - d3.sum(baseDots);
      const order = exactDots
        .map((v, i) => ({ i, r: v - baseDots[i] }))
        .sort((a, b) => b.r - a.r);

      for (let k = 0; k < remaining; k++) baseDots[order[k].i]++;

      parts.forEach((p) => {
        if (baseDots[p.part_id] === 0) return;
        const pts = allocate(
          { type: "Feature", geometry: p.geom },
          baseDots[p.part_id],
        );
        pts.forEach((pt) => {
          points.push({
            geom: pt.geometry,
            geom_id: `${geom_id}_${p.part_id}`,
            data: value,
            data_id,
            id: pointCounter++,
          });
        });
      });
    }
  });

  return { featureCollection: { type: "FeatureCollection", features: points } };
}

function allocate(feature, nbdots) {
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
