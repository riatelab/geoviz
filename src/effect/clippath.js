import { unique } from "../helpers/utils";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

/**
 * @function effect/clipPath
 * @description The `clipPath` function allows to create a clip layer. The function adds a clip layer to the SVG container and returns the id like `"url(#id)"`. WARNING - the clip is valid for the entireweb  page, not just the map
 * @see {@link https://observablehq.com/@neocartocnrs/effect}
 *
 * @property {string} [id] - clip id.
 * @property {object} [datum = { type: "Sphere" }] - datum to clip
 * @property {string} [permanent = false] - boolean to have ore not a static clippath
 * @example
 * // There are several ways to use this function
 * geoviz.effect.clipPath(svg, { datum: world })  // where svg is the container
 * svg.effect.clipPath({ datum: world })  // where svg is the container
 * svg.plot({ type:"clipPath", datum: world })  // where svg is the container
 */
export function clipPath(
  svg,
  { id = unique(), datum = { type: "Sphere" }, permanent = false } = {}
) {
  let layer = svg.append("g");

  // zoomable layer
  if (svg.zoomable && !svg.parent && permanent == false) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(id)) {
      svg.zoomablelayers.push({ mark: "clippath", id: id });
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == id)
      );
      svg.zoomablelayers[i] = { mark: "clippath", id: id };
    }
  }

  layer
    .append("clipPath")
    .attr("id", id)
    .append("path")
    .datum(datum)
    .attr("d", d3.geoPath(svg.projection));

  return `url(#${id})`;
}
