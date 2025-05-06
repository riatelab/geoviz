import { create } from "d3-selection";
import { descending } from "d3-array";
const d3 = Object.assign({}, { create, descending });

// Create unique id
export function unique() {
  const length = 15;
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Proerries entries
export function propertiesentries(x) {
  let arr = [];
  x.features.map((d) => d.properties).forEach((d) => arr.push(Object.keys(d)));
  return [...new Set(arr.flat())];
}

// Detect input
export function detectinput(input, columns = []) {
  if (typeof input == "function") {
    return "function";
  } else if (typeof input == "string" && columns.includes(input)) {
    return "field";
  } else {
    return "value";
  }
}

// check attributes
export function check(input, columns) {
  if (typeof input == "function") {
    return input;
  } else if (typeof input == "string" && columns.includes(input)) {
    return (d) => d.properties[input];
  } else {
    return input;
  }
}

// Get svg node size
export function getsize(elt) {
  const clonetxt = elt.clone(true);
  const svg = d3.create("svg");
  svg.node().appendChild(clonetxt.node());
  document.body.appendChild(svg.node());
  const { x, y, width, height } = clonetxt.node().getBBox();
  document.body.removeChild(svg.node());
  let dims = { x, y, width, height };
  return dims;
}

// Camelcase to dash.
// e.g. "strokeWidth" -> "stroke-width"
// and "rect_strokeWidth" -> "stroke-width"
export function camelcasetodash(str, prefix = "") {
  return str
    .split(/(?=[A-Z])/)
    .map((d) => d.toLowerCase())
    .join("-")
    .replace(prefix + "_", "");
}

// noth angle (for north arrow)
export function northangle(pos, projection) {
  const geopos = projection.invert(pos);
  const geopostop = projection([geopos[0], geopos[1] + 3]);
  const geoposbottom = projection([geopos[0], geopos[1] - 3]);
  const xdelta = geopostop[0] - geoposbottom[0];
  const ydelta = geoposbottom[1] - geopostop[1];
  let angle = Math.atan(xdelta / ydelta) * (180 / Math.PI);
  const posnorth = projection([0, 90]);
  if (pos[1] < posnorth[1]) {
    angle = angle + 180;
  }
  return angle;
}

// GeoJSON implantation
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

// Columns
export function columns(x) {
  let arr = [];
  x.forEach((d) => arr.push(Object.keys(d)));
  return [...new Set(arr.flat())];
}

export function order(features, arg, { fields, descending = true } = {}) {
  fields = fields ? fields : columns(features.map((d) => d.properties));
  switch (detectinput(arg, fields)) {
    case "value":
      return features;
    case "function":
      return features.sort(arg);
    case "field":
      if (descending) {
        return features.sort((a, b) =>
          d3.descending(
            Math.abs(+a.properties[arg]),
            Math.abs(+b.properties[arg])
          )
        );
      } else {
        return features.sort((a, b) =>
          d3.descending(
            Math.abs(+b.properties[arg]),
            Math.abs(+a.properties[arg])
          )
        );
      }
  }
}

export function isNumber(value) {
  return (
    value !== null &&
    value !== "" &&
    typeof value !== "boolean" &&
    isFinite(value)
  );
}

// convert svg trtansform attribute to an object
export function transform2obj(str) {
  if (str) {
    const arr = str
      .trim()
      .split(/\(|\)/)
      .map((d) => d.replace(" ", ""))
      .filter((d) => d != "");

    let obj = {};

    ["translate", "rotate", "scale", "skewX", "skewY"].forEach((d) => {
      obj = {
        ...obj,
        [d]:
          arr.indexOf(d) !== -1
            ? arr[arr.indexOf(d) + 1].split(",").map((d) => +d)
            : undefined,
      };
    });
    return obj;
  } else return undefined;
}
