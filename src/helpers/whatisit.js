export function whatisit(x) {
  // FeatureCollection
  if (typeof x == "object" && x.type == "FeatureCollection") {
    return "FeatureCollection";
  }

  // features
  if (
    Array.isArray(x) &&
    x[0]?.type == "Feature" &&
    x[0].hasOwnProperty("geometry")
  ) {
    return "features";
  }

  // bbox
  if (
    Array.isArray(x) &&
    x.length == 2 &&
    Array.isArray(x[0]) &&
    Array.isArray(x[1]) &&
    Array.isArray(x[0]) &&
    x[0]?.length == 2 &&
    x[1]?.length == 2
  ) {
    return "bbox";
  }
}
