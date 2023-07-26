import { bbox } from "./bbox";
import { whatisit } from "../helpers/whatisit";

export function extent(x) {
  if (x == null || x == "") {
    return { type: "Sphere" };
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
