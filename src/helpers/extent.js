import { bbox } from "./bbox";
import { whatisit } from "../helpers/whatisit";

export function extent(x, proj) {
  if ((x == null || x == "") && proj !== "none") {
    return { type: "Sphere" };
  }

  if ((x == null || x == "") && proj == "none") {
    return bbox([
      [0, 0],
      [0, 0],
    ]);
  }

  if (whatisit(x) == "bbox") {
    return bbox(x);
  }

  if (whatisit(x) == "FeatureCollection") {
    return x;
  }

  if (
    Array.isArray(x) &&
    [...new Set(x.map((d) => whatisit(d)))].length == 1 &&
    whatisit(x[0]) == "FeatureCollection"
  ) {
    let all = [];
    x.forEach((d) => all.push(d.features));
    return {
      type: "FeatureCollection",
      features: all.flat(),
    };
  }
}
