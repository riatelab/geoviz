import { create } from "./create";
import { geoEquirectangular } from "d3-geo";
const d3 = Object.assign({}, { geoEquirectangular });

export function draw(json) {
  let params = json?.params || {};
  // layer types
  let layertypes = json.layers.map((d) => d.type);
  // projection
  if (layertypes.includes("tile")) {
    params.projection = "mercator";
  } else if (
    layertypes.includes("outline") ||
    layertypes.includes("graticule")
  ) {
    params.projection = d3.geoEquirectangular();
  }
  // Domain
  if (!params?.domain && !json.layers.map((d) => d.type).includes("outline")) {
    params.domain = [];
    json.layers.map((d) => {
      params.domain.push(d?.data || d?.datum);
    });
    params.domain = Array.isArray(params.domain)
      ? params.domain.filter((d) => d != undefined)
      : params.domain;
  }
  params.domain = params.domain == "outline" ? undefined : params.domain;
  let svg = create(params);
  json.layers.forEach((d) => {
    svg.plot(d);
  });
  return svg.render();
}
