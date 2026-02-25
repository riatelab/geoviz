import turf from "@turf/turf";

/**
 * Rewind GeoJSON avec option pour polaires
 * @param {GeoJSON} data FeatureCollection
 * @param {Object} options
 * @param {boolean} [options.mutate=false] - si false, copie le GeoJSON
 * @param {boolean} [options.rewindPole=false] - si true, on rewinde aussi les polaires
 */
export function rewind(data, options = {}) {
  const mutate = options.mutate === true;
  const rewindPole = options.rewindPole === true;
  const geo = mutate ? data : structuredClone(data);

  for (const f of geo.features) {
    let g = f.geometry;
    if (!g) continue;

    g = cleanGeom(g);
    if (!g) {
      f.geometry = null;
      continue;
    }

    // Détection des polaires
    let isPolar = false;
    const lats = [];
    turf.coordEach(g, ([, lat]) => lats.push(lat));
    if (Math.min(...lats) <= -89.9) isPolar = "south";
    else if (Math.max(...lats) >= 89.9) isPolar = "north";

    if (isPolar) {
      if (rewindPole) {
        // Inverse chaque anneau du polaire
        if (g.type === "Polygon") g.coordinates.forEach((r) => r.reverse());
        else if (g.type === "MultiPolygon")
          g.coordinates.forEach((poly) => poly.forEach((r) => r.reverse()));
      }
      // Sinon on laisse tel quel
      f.geometry = g;
      continue;
    }

    // Rewind classique pour tous les polygones non polaires
    if (g.type === "Polygon") g.coordinates = fixPolySpherical(g.coordinates);
    else if (g.type === "MultiPolygon")
      g.coordinates = g.coordinates.map(fixPolySpherical);

    f.geometry = g.coordinates && g.coordinates.length ? g : null;
  }

  return geo;
}

// ---------------- Fonctions auxiliaires ----------------

function cleanGeom(geom) {
  function cleanRing(ring) {
    if (!ring || ring.length < 2) return null;
    const cleaned = [ring[0]];
    for (let i = 1; i < ring.length; i++) {
      const [x, y] = ring[i];
      const [x0, y0] = cleaned[cleaned.length - 1];
      if (x !== x0 || y !== y0) cleaned.push(ring[i]);
    }
    const f = cleaned[0],
      l = cleaned[cleaned.length - 1];
    if (f[0] !== l[0] || f[1] !== l[1]) cleaned.push([...f]);
    if (cleaned.length < 4) return null;
    return cleaned;
  }

  if (geom.type === "Polygon") {
    const rings = geom.coordinates.map(cleanRing).filter(Boolean);
    return rings.length ? { ...geom, coordinates: rings } : null;
  }
  if (geom.type === "MultiPolygon") {
    const polys = geom.coordinates
      .map((poly) => poly.map(cleanRing).filter(Boolean))
      .filter((p) => p.length);
    return polys.length ? { ...geom, coordinates: polys } : null;
  }
  return geom;
}

function fixPolySpherical(rings) {
  const outer = rings[0],
    inners = rings.slice(1);
  rewindRing(outer, true);
  inners.forEach((r) => rewindRing(r, false));
  return [outer, ...inners];
}

function rewindRing(ring, dir) {
  let tArea = 0,
    err = 0;
  for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
    const k = (ring[i][0] - ring[j][0]) * (ring[j][1] + ring[i][1]);
    const m = tArea + k;
    err += Math.abs(tArea) >= Math.abs(k) ? tArea - m + k : k - m + tArea;
    tArea = m;
  }
  if (tArea + err >= 0 !== !!dir) ring.reverse();
}
