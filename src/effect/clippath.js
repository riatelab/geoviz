import { unique } from "../helpers/utils";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

/**
 * @description The `clipPath` function allows to create a clip layer. WARNING - the clip is valid for the entireweb  page, not just the map
 * @see {@link https://observablehq.com/@neocartocnrs/effect}
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} arg - options and parameters
 * @param {string} arg.id - clip id. In another layer
 * @param {object} arg.datum - datum to clip
 * @param {string} arg.permanent - boolean to have ore not a static clippath
 * @example
 * geoviz.effect.clipPath(svg, { datum: world })  // where svg is the container
 * svg.effect.clipPath({ datum: world })  // where svg is the container
 * @returns {SVGSVGElement|string} - the function adds a clip layer to the SVG container and returns the id like "url(#id)".
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
