import { extent } from "../helpers/extent";
import { create as create2 } from "d3-selection";
import {
  geoPath,
  geoBounds,
  geoEquirectangular,
  geoMercator,
  geoIdentity,
} from "d3-geo";
const d3 = Object.assign(
  {},
  { create2, geoPath, geoBounds, geoEquirectangular, geoMercator, geoIdentity }
);

import { outline as addoutline } from "../mark/outline.js";
import { graticule as addgraticule } from "../mark/graticule.js";
import { text as addtext } from "../mark/text.js";
import { circle as addcircle } from "../mark/circle.js";
import { spike as addspike } from "../mark/spike.js";
import { triangle as addtriangle } from "../mark/triangle.js";
import { path as addpath } from "../mark/path.js";
import { tile } from "../mark/tile.js";
import { header } from "../mark/header.js";
import { footer } from "../mark/footer.js";
import { scalebar as addscalebar } from "../mark/scalebar.js";
import { north as addnorth } from "../mark/north.js";
import { clipPath as addclippath } from "../effect/clippath.js";
import { blur as addblur } from "../effect/blur.js";
import { shadow as addshadow } from "../effect/shadow.js";
import { radialGradient as addradialGradient } from "../effect/radialgradient.js";

import { circles_nested as addcircles_nested } from "../legend/circles-nested";
import { circles as addcircles } from "../legend/circles";
import { spikes as addspikes } from "../legend/spikes";
import { choro_vertical as addchoro_vertical } from "../legend/choro-vertical";
import { choro_horizontal as addchoro_horizontal } from "../legend/choro-horizontal";
import { typo_vertical as addtypo_vertical } from "../legend/typo-vertical";
import { typo_horizontal as addtypo_horizontal } from "../legend/typo-horizontal";
import { box as addbox } from "../legend/box";
import { render as addrender } from "../container/render";

import { choropleth as addchoropleth } from "../symbology/choropleth.js";

/**
 * @description The `create` function is the first step in map construction. t creates an svg container into which the various layers can be added.
 * @see {@link https://observablehq.com/@neocartocnrs/geoviz}
 *
 * @param {object} arg - options and parameters
 * @param {number} arg.height - height of the container
 * @param {number} arg.width - width of the container. This value is automatically calculated according to `domain`. But it can be forced by entering a value.
 * @param {object|object[]} arg.domain - the domain corresponds to the geographical area to be displayed. It is defined by a geoJSON or an array containing geoJSONs. By default, the entire world is represented.
 * @param {function|string} arg.projection - projection definition. See [d3-geo](https://github.com/d3/d3-geo) & [d3-geo-projection](https://github.com/d3/d3-geo-projection). You can aslo write "mercator" tu use tiles.
 * @param {number[]} arg.pos - position of the container (if contained in another svg container)
 * @param {string} arg.background - background color
 * @param {string} arg.fontFamily - font-family for the entire map
 * @param {number|number[]} arg.margin - margins around the map. A number to set the same margin everywhere or an array [top, right, bottom, left] to set different margins.
 * @param {object} arg.parent - name of parent container into which this child container is to be included. In this case, the options.pos parameter is also used.
 * @param {boolean|number|string} arg.zoomable - activates the map zoom function. If you set an array of 2 values, it defines the scaleExtent (default: [1,8]). Use "versor" to activate [versor zoom](https://github.com/d3/versor). "Versor" is only available for vector geometries in wgs84.
 * @example
 * let svg = geoviz.create({width: 500, background: "lightblue"})
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
  fontFamily = "Arial",
  zoomable = false,
} = {}) {
  // projection
  switch (projection) {
    case "mercator":
      projection = d3.geoMercator();
      break;
    case "none":
      projection = d3.geoIdentity();
      break;
  }

  // Font
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

    console.log([
      [x0, y0],
      [x1, y1],
    ]);

    height = Math.ceil(y1 - y0) + margin[0] + margin[2];

    let trans = projection.translate();
    projection.translate([trans[0] + margin[3], trans[1] + margin[0]]);
    projection.clipExtent([
      [0, 0],
      [width, height],
    ]);
    info = {
      projection,
      baseScale: projection.scale(),
      baseTranslate: projection.translate(),
      margin,
      width,
      height,
      height_header: 0,
      height_footer: 0,
      fontFamily,
      zoomable,
      zoomablelayers: [],
      zoom: { k: 1, x: 0, y: 0 },
      bbox: d3.geoBounds(ref),
      inset: parent ? true : false,
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

  let mark = {};
  [
    { id: "outline", func: addoutline },
    { id: "path", func: addpath },
    { id: "graticule", func: addgraticule },
    { id: "circle", func: addcircle },
    { id: "spike", func: addspike },
    { id: "triangle", func: addtriangle },
    { id: "text", func: addtext },
    { id: "tile", func: tile },
    { id: "header", func: header },
    { id: "footer", func: footer },
    { id: "scalebar", func: addscalebar },
    { id: "north", func: addnorth },
  ].forEach(
    (d) =>
      (mark[d.id] = function () {
        return d.func(output, arguments[0]);
      })
  );

  let legend = {};
  [
    { id: "circles_nested", func: addcircles_nested },
    { id: "circles", func: addcircles },
    { id: "spikes", func: addspikes },
    { id: "choro_vertical", func: addchoro_vertical },
    { id: "choro_horizontal", func: addchoro_horizontal },
    { id: "typo_vertical", func: addtypo_vertical },
    { id: "typo_horizontal", func: addtypo_horizontal },
    { id: "box", func: addbox },
  ].forEach(
    (d) =>
      (legend[d.id] = function () {
        return d.func(output, arguments[0]);
      })
  );

  let effect = {};
  [
    { id: "blur", func: addblur },
    { id: "shadow", func: addshadow },
    { id: "radialGradient", func: addradialGradient },
    { id: "clipPath", func: addclippath },

    ,
  ].forEach(
    (d) =>
      (effect[d.id] = function () {
        return d.func(output, arguments[0]);
      })
  );

  // let symbology = {};
  // [{ id: "choropleth", func: addchoropleth }, ,].forEach(
  //   (d) =>
  //     (symbology[d.id] = function () {
  //       return d.func(output, arguments[0]);
  //     })
  // );

  // Output

  return Object.assign(output, {
    //...symbology,
    ...mark,
    legend,
    effect,
    render: function () {
      return addrender(output, arguments[0]);
    },
  });
}
