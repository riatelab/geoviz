import { tooltip } from "../helpers/tooltip";
import { addattr } from "../helpers/addattr";
import { random } from "../classify/random";
import { implantation } from "../helpers/implantation";
import { unique } from "../helpers/unique";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

/**
 * The `geopath` function generates SVG paths from a geoJSON
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.data - GeoJSON FeatureCollection. Use data to be able to iterate
 * @param {object} options.datum - GeoJSON FeatureCollection. Use datum if you don't need to iterate.
 * @param {string} options.id - id of the layer
 * @param {string|function} options.projection - use "none" if the coordinates are already in the plan of the page. If this field is left blank, the global container projection is applied.
 * @param {string|function} options.fill - fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} options.stroke - stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} options.strokeWidth - stroke-width
 * @param {string|function} options.tip - tooltip content
 * @param {object} options.tipstyle - tooltip style
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let circles = geoviz.layer.geopath(main, { data: world, fill: "red" })
 * @returns {SVGSVGElement|string} - the function adds a layer with SVG paths to the SVG container and returns the layer identifier.
 */
export function geopath(
  svg,
  {
    id = unique(),
    projection,
    data,
    datum,
    tip,
    tipstyle,
    fill,
    stroke,
    strokeWidth = 1,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Projection
  projection = projection == "none" ? null : svg.projection;

  console.log(projection);

  // DATUM -----------------------------------------
  if (datum) {
    // Colors by default
    if (!fill) {
      fill = implantation(datum) == 2 ? "none" : random();
    }
    if (!stroke) {
      stroke = implantation(datum) == 2 ? random() : "none";
    }

    // ...attr
    addattr({
      layer,
      args: arguments[1],
      exclude: ["fill", "stroke"],
    });

    layer
      .append("path")
      .datum(datum)
      .attr("d", d3.geoPath(projection))
      .attr("fill", fill)
      .attr("stroke", stroke);
  }

  // DATA -----------------------------------------
  if (data) {
    // Colors by default
    if (!fill) {
      fill = implantation(data) == 2 ? "none" : random();
    }
    if (!stroke) {
      stroke = implantation(data) == 2 ? random() : "white";
    }
    // ...attr
    addattr({
      layer,
      args: arguments[1],
      exclude: ["fill", "stroke"],
    });

    layer
      .selectAll("path")
      .data(data.features.filter((d) => d.geometry !== null))
      .join("path")
      .attr("d", d3.geoPath(projection))
      .attr("fill", fill)
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth);

    // Tooltip
    if (tip) {
      tooltip(layer, svg, tip, tipstyle);
    }
  }

  return `#${id}`;
}
