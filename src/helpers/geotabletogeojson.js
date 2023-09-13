export function geotabletogeojson(geotable, { geometry = "geometry" } = {}) {
  let properties = JSON.parse(JSON.stringify(geotable));
  let geom = properties.map((d) => d[geometry]);
  properties.forEach((d) => delete d[geometry]);
  let features = properties.map((d, i) => ({
    type: "Feature",
    properties: d,
    geometry: geom[i],
  }));

  return { type: "FeatureCollection", features };
}
