import { unique } from "../helpers/utils";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

/**
 * The `clippath` function allows to create a clip layer
 * WARNING - the clip is valid for the entireweb  page, not just the map
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - clip id. In another layer
 * @param {object} options.datum - datum to clip
 * @param {string} options.permanent - boolean to have ore not a static clippath
 * @example
 * let myclip = geoviz.style.clippath(main, { datum: world })
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
