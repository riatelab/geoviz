import { unique } from "../helpers/unique";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

/**
 * The `clippath` function allows to create a clip layer
 * WARNING - the clip is valid for the entireweb  page, not just the map
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.id - clip id. In another layer, it can be used wtith the atribute clipPath loike this: clipPath: "url(#chosenid)"
 * @param {object} options.datum - datum to clip
 * @example
 * let myclip = geoviz.layer.clippath(main, { datum: world })
 * @returns {SVGSVGElement|string} - the function adds a clip layer to the SVG container and returns the layer identifier.
 */
export function clippath(
  svg,
  { id = unique(), datum = { type: "Sphere" } } = {}
) {
  svg
    .append("clipPath")
    .attr("id", id)
    .append("path")
    .datum(datum)
    .attr("d", d3.geoPath(svg.projection));

  return `#${id}`;
}
