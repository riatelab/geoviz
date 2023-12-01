export function implantation(x) {
  let types = Array.from(
    new Set(
      x.features.filter((d) => d.geometry !== null).map((d) => d.geometry.type)
    )
  );
  let tmp = [];
  if (types.indexOf("Polygon") !== -1 || types.indexOf("MultiPolygon") !== -1) {
    tmp.push(3);
  }
  if (
    types.indexOf("LineString") !== -1 ||
    types.indexOf("MultiLineString") !== -1
  ) {
    tmp.push(2);
  }
  if (types.indexOf("Point") !== -1 || types.indexOf("MultiPoint") !== -1) {
    tmp.push(1);
  }
  let result = tmp.length == 1 ? tmp[0] : -1;
  return result;
}
