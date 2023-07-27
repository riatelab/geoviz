import { whatisit } from "../helpers/whatisit";
import { coords2geo } from "../helpers/coords2geo";
import { bbox } from "../helpers/bbox";

export function featurecollection(x, options = {}) {
  x = JSON.parse(JSON.stringify(x));

  if (whatisit(x) == "table" && checkOptions) {
    return coords2geo(x, options);
  } else {
    switch (whatisit(x)) {
      case "FeatureCollection":
        return x;
        break;
      case "features":
        return { type: "FeatureCollection", features: x };
        break;
      case "feature":
        return { type: "FeatureCollection", features: [x] };
        break;
      case "geometries":
        return {
          type: "FeatureCollection",
          features: x.map((d) => ({
            type: "Feature",
            properties: {},
            geometry: d,
          })),
        };
        break;
      case "geometry":
        return {
          type: "FeatureCollection",
          features: {
            type: "Feature",
            properties: {},
            geometry: [x],
          },
        };
        break;
      case "bbox":
        return bbox(x);
        break;
      default:
        return x;
    }
  }
}

function checkOptions(options) {
  if (
    (options.lat && options.lon) ||
    (options.latitude && options.longitude) ||
    options.coords ||
    options.coordinates
  ) {
    return true;
  } else {
    return false;
  }
}
