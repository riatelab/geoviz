export function whatisit(x) {
  // FeatureCollection
  if (isFeatureCollection(x)) {
    return "FeatureCollection";
  }
  // Array of features
  if (isFeatures(x)) {
    return "features";
  }

  // Single feature
  if (isFeature(x)) {
    return "feature";
  }

  // Array of geometries
  if (isGeometries(x)) {
    return "geometries";
  }

  // single geometry
  if (isGeometry(x)) {
    return "geometry";
  }

  // Array of objets
  if (isArrayOfObjects(x)) {
    return "table";
  }

  // bbox
  if (isBbox(x)) {
    return "bbox";
  }
}

function isFeatureCollection(x) {
  return typeof x == "object" &&
    !Array.isArray(x) &&
    x.type == "FeatureCollection"
    ? true
    : false;
}

function isFeatures(x) {
  return Array.isArray(x) &&
    x[0]?.type == "Feature" &&
    x[0].hasOwnProperty("geometry")
    ? true
    : false;
}

function isFeature(x) {
  return !Array.isArray(x) &&
    typeof x == "object" &&
    x?.type == "Feature" &&
    x.hasOwnProperty("geometry")
    ? true
    : false;
}

function isBbox(x) {
  return Array.isArray(x) &&
    x.length == 2 &&
    Array.isArray(x[0]) &&
    Array.isArray(x[1]) &&
    Array.isArray(x[0]) &&
    x[0]?.length == 2 &&
    x[1]?.length == 2
    ? true
    : false;
}

function isGeometries(x) {
  return Array.isArray(x) &&
    x[0].hasOwnProperty("type") &&
    x[0].hasOwnProperty("coordinates")
    ? true
    : false;
}

function isGeometry(x) {
  return (
    !Array.isArray(x) &&
      typeof x == "object" &&
      x.hasOwnProperty("coordinates"),
    x.hasOwnProperty("type") && Array.isArray(x?.coordinates) ? true : false
  );
}

function isArrayOfObjects(x) {
  return !isBbox(x) &&
    Array.isArray(x) &&
    typeof x[0] == "object" &&
    Object.keys(x[0]).length !== 0
    ? true
    : false;
}
