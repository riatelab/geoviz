import { extent } from "../helpers/extent";
import { unique } from "../helpers/utils";
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
import { halfcircle as addhalfcircle } from "../mark/halfcircle.js";
import { spike as addspike } from "../mark/spike.js";
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
import { circles_half as addcircles_half } from "../legend/circles-half";
import { spikes as addspikes } from "../legend/spikes.js";
import { mushrooms as addmushrooms } from "../legend/mushrooms.js";
import { choro_vertical as addchoro_vertical } from "../legend/choro-vertical";
import { choro_horizontal as addchoro_horizontal } from "../legend/choro-horizontal";
import { typo_vertical as addtypo_vertical } from "../legend/typo-vertical";
import { typo_horizontal as addtypo_horizontal } from "../legend/typo-horizontal";
import { box as addbox } from "../legend/box";
import { render as addrender } from "../container/render";

import { plot as addplot } from "../plot/plot.js";

/**
 * @function create
 * @description The `create` function is the first step in map construction. It creates an svg container + some information about this container:`projection`, `margin`, `width`, `height` and `bbox`.
 * @see {@link https://observablehq.com/@neocartocnrs/geoviz}
 *
 * @property {number} [width = 1000] - width of the container.
 * @property {number} [height] - height of the container. This value is automatically calculated according to `domain`. But it can be forced by entering a value.
 * @property {object|object[]} [domain] - the domain corresponds to the geographical area to be displayed. It is defined by a geoJSON or an array containing geoJSONs.
 * @property {function|string} [projection] - d3 function of projection. See [d3-geo](https://github.com/d3/d3-geo) & [d3-geo-projection](https://github.com/d3/d3-geo-projection). You can aslo write "mercator" to use tiles. (default: "none")
 * @property {number[]} [pos] - position of the container (if contained in another svg container)
 * @property {string} [background] - background color
 * @property {string} [fontFamily] - font-family for the entire map
 * @property {number|number[]} [margin = 0] - margins around the map. A number to set the same margin everywhere or an array [top, right, bottom, left] to set different margins.
 * @property {object} [parent] - name of parent container into which this child container is to be included. In this case, the options.pos parameter is also used.
 * @property {boolean|number|string} [zoomable] - activates the map zoom function. If you set an array of 2 values, it defines the scaleExtent (default: [1,8]). Use "versor" to activate [versor zoom](https://github.com/d3/versor). "versor" is only available for vector geometries in wgs84.
 * @property {boolean|number[]} [control] - If zoomable is enabled, set the control parameter as true displays control buttons to zoom on the map. You can also define an array of 2 values to locate the panel in the position you want (e.g. [100, 200]). This setting is not available with the Versor zoom.
 * @property {boolean} [warning = true] - display or not warnings on the map
 *
 * @example
 * let svg = geoviz.create({width: 500, background: "lightblue"})
 */

export function create({
  height = null,
  //projection = d3.geoEquirectangular(),
  projection = "none",
  domain,
  pos = [0, 0],
  background = "none",
  width = 1000,
  margin = [0, 0, 0, 0],
  parent = null,
  fontFamily = "Arial",
  zoomable = false,
  control = true,
  warning = true,
  warning_message = [],
} = {}) {
  // projection
  const initproj = projection;
  switch (projection) {
    case "mercator":
      projection = d3.geoMercator();
      break;
    case "none":
      projection = d3.geoIdentity().reflectY(true);
      break;
  }

  // Font
  let output;
  let info;
  if (height !== null) {
    info = { width, height, fontFamily };
  } else {
    //adapt scale
    let ref = extent(domain, initproj);

    margin = Array.isArray(margin) ? margin : Array(4).fill(margin);
    const [[x0, y0], [x1, y1]] = d3
      .geoPath(projection.fitWidth(width - margin[1] - margin[3], ref))
      .bounds(ref);

    height = Math.ceil(y1 - y0) + margin[0] + margin[2];

    let trans = projection.translate();
    projection.translate([trans[0] + margin[3], trans[1] + margin[0]]);
    projection.clipExtent([
      [0, 0],
      [width, height],
    ]);
    info = {
      initproj,
      domain,
      projection,
      baseScale: projection.scale(),
      baseTranslate: projection.translate(),
      margin,
      width,
      height,
      viewbox: [],
      height_header: 0,
      height_footer: 0,
      fontFamily,
      zoomable,
      control,
      controlid: "control_" + unique(),
      zoomablelayers: [],
      zoom: { k: 1, x: 0, y: 0 },
      bbox: d3.geoBounds(ref),
      inset: parent ? true : false,
      warning,
      warning_message,
      data: false,
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
    { id: "halfcircle", func: addhalfcircle },
    { id: "spike", func: addspike },
    { id: "text", func: addtext },
    { id: "tile", func: tile },
    { id: "header", func: header },
    { id: "footer", func: footer },
    { id: "scalebar", func: addscalebar },
    { id: "north", func: addnorth },
    { id: "plot", func: addplot },
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
    { id: "circles_half", func: addcircles_half },
    { id: "spikes", func: addspikes },
    { id: "mushrooms", func: addmushrooms },
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

  // Output

  return Object.assign(output, {
    ...mark,
    legend,
    effect,
    render: function () {
      return addrender(output, arguments[0]);
    },
  });
}
