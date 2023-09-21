import { extent } from "../helpers/extent";
import { create as create2 } from "d3-selection";
import { geoPath, geoBounds, geoEquirectangular } from "d3-geo";
const d3 = Object.assign(
  {},
  { create2, geoPath, geoBounds, geoEquirectangular }
);

import { outline as addoutline } from "../layer/outline";
import { geopath as addgeopath } from "../layer/geopath";
import { graticule as addgraticule } from "../layer/graticule";
import { text as addtext } from "../layer/text";
import { circle as addcircle } from "../layer/circle";
import { label as addlabel } from "../layer/label";
import { tile } from "../layer/tile";
import { header } from "../layer/header";

import { circles_nested as addcircles_nested } from "../legend/circles-nested";
import { circles as addcircles } from "../legend/circles";
import { choro_vertical as addchoro_vertical } from "../legend/choro-vertical";
import { choro_horizontal as addchoro_horizontal } from "../legend/choro-horizontal";
import { typo_vertical as addtypo_vertical } from "../legend/typo-vertical";
import { typo_horizontal as addtypo_horizontal } from "../legend/typo-horizontal";
import { box as addbox } from "../legend/box";
import { render as addrender } from "../container/render";

/**
 * The `create` function is the first step in map construction.
 * It creates an svg container into which the various layers can be added.
 *
 * @param {object} options - options and parameters
 * @param {number} options.height - height of the container
 * @param {number} options.width - width of the container. This value is automatically calculated according to `domain`. But it can be forced by entering a value.
 * @param {object|object[]} options.domain - the domain corresponds to the geographical area to be displayed. It is defined by a geoJSON or an array containing geoJSONs. By default, the entire world is represented.
 * @param {function} options.projection - projection definition. See [d3-geo](https://github.com/d3/d3-geo) & [d3-geo-projection](https://github.com/d3/d3-geo-projection)
 * @param {number[]} options.pos - position of the container (if contained in another svg container)
 * @param {string} options.background - background color
 * @param {string} options.fontFamily - font-family for the entire map
 * @param {number|number[]} options.margin - margins around the map. A number to set the same margin everywhere or an array [top, right, bottom, left] to set different margins.
 * @param {object} options.parent - name of parent container into which this child container is to be included. In this case, the options.pos parameter is also used.
 * @example
 * let main = geoviz.container.create({width: 500, background: "lightblue"})
 * @returns {SVGSVGElement} - the function returns a svg container + some information about this container:`projection`, `margin`, `width`, `height` and `bbox`
 */

export function create({
  height = null,
  projection = d3.geoEquirectangular(),
  domain,
  pos = [0, 0],
  background = "none",
  width = 1000,
  margin = [0, 0, 0, 0],
  parent = null,
  fontFamily = "Roboto",
} = {}) {
  // Font
  let link = document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute("href", "https://fonts.googleapis.com/css2?family=Roboto");
  document.head.appendChild(link);

  let output;
  let info;
  if (height !== null) {
    info = { width, height, fontFamily };
  } else {
    //adapt scale
    let ref = extent(domain);
    margin = Array.isArray(margin) ? margin : Array(4).fill(margin);
    const [[x0, y0], [x1, y1]] = d3
      .geoPath(projection.fitWidth(width - margin[1] - margin[3], ref))
      .bounds(ref);

    height = Math.ceil(y1 - y0) + margin[0] + margin[2];

    let trans = projection.translate();
    projection.translate([trans[0] + margin[3], trans[1] + margin[0]]);
    info = {
      projection,
      margin,
      width,
      height,
      fontFamily,
      bbox: d3.geoBounds(ref),
    };
  }

  if (parent == null) {
    let svg = d3
      .create2("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("background-color", background);
    svg.append("defs").attr("id", "defs");
    svg.append("g").attr("id", "geoviztooltip");

    output = Object.assign(svg, info);
  } else {
    let svg = parent
      .append("g")
      .attr("transform", `translate(${pos[0]},${pos[1]})`);
    svg.append("defs").attr("id", "defs");
    svg
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", background);
    svg.append("g").attr("id", "geoviztooltip");

    output = Object.assign(svg, info);
  }

  // Add functions

  let layer = {};
  [
    { id: "outline", func: addoutline },
    { id: "geopath", func: addgeopath },
    { id: "graticule", func: addgraticule },
    { id: "circle", func: addcircle },
    { id: "label", func: addlabel },
    { id: "text", func: addtext },
    { id: "tile", func: tile },
    { id: "header", func: header },
  ].forEach(
    (d) =>
      (layer[d.id] = function () {
        d.func(output, arguments[0]);
      })
  );

  let legend = {};
  [
    { id: "circles_nested", func: addcircles_nested },
    { id: "circles", func: addcircles },
    { id: "choro_vertical", func: addchoro_vertical },
    { id: "choro_horizontal", func: addchoro_horizontal },
    { id: "typo_vertical", func: addtypo_vertical },
    { id: "typo_horizontal", func: addtypo_horizontal },
    { id: "box", func: addbox },
  ].forEach(
    (d) =>
      (legend[d.id] = function () {
        d.func(output, arguments[0]);
      })
  );
  // Output

  return Object.assign(output, {
    layer,
    legend,
    render: function () {
      return addrender(output, arguments[0]);
    },
  });
}
