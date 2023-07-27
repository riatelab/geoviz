export function coords2geo(data, options = {}) {
  let lat = options.lat || options.latitude;
  let lon = options.lon || options.lng || options.longitude;
  let coords = options.coords || options.coordinates;
  let sep =
    options.sep || options.separator ? options.sep || options.separator : ",";
  let reverse = options.reverse ? true : false;

  // case1: lat & lng coords in separate columns
  if (lat && lon) {
    let x = reverse ? lon : lat;
    let y = reverse ? lat : lon;

    return {
      type: "FeatureCollection",
      features: data.map((d) => ({
        type: "Feature",
        properties: d,
        geometry: {
          type: "Point",
          coordinates: [+d[y], +d[x]],
        },
      })),
    };
  }

  // case2: lat & lng coords in a single column

  if (coords) {
    return {
      type: "FeatureCollection",
      features: data.map((d) => ({
        type: "Feature",
        properties: d,
        geometry: {
          type: "Point",
          coordinates: reverse
            ? getcoords(d[coords])
            : getcoords(d[coords]).reverse(),
        },
      })),
    };
  }

  return coords;
}

function txt2coords(str, sep = ",") {
  str = str.replace(/[ ]+/g, "");
  let coords = str
    .split(sep)
    .map((d) => d.replace(",", "."))
    .map((d) => d.replace(/[^\d.-]/g, ""))
    .map((d) => +d);

  if (coords.length != 2) {
    coords = [undefined, undefined];
  }
  return coords;
}

function wkt2coords(str) {
  let result = str.match(/\(([^)]+)\)/g);
  return result === null
    ? [undefined, undefined]
    : result[0]
        .replace(/\s\s+/g, " ")
        .replace("(", "")
        .replace(")", "")
        .trimStart()
        .trimEnd()
        .split(" ")
        .map((d) => d.replace(",", "."))
        .map((d) => +d);
}

function getcoords(str) {
  return str
    ? str.toLowerCase().includes("point")
      ? wkt2coords(str)
      : txt2coords(str)
    : null;
}
