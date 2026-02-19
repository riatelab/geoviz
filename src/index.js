// Containerutils/
import { create } from "./container/create";
import { render } from "./container/render";
export let container = {
  create,
  render,
};

// Tool
import { centroid } from "./tool/centroid.js";
import { polygonstorandompoints } from "./tool/polygonstorandompoints.js";
import { flattendots } from "./tool/flattendots.js";
import { ridge } from "./tool/ridge.js";
import { dissolve } from "./tool/dissolve.js";
import { project } from "./tool/project.js";
import { unproject } from "./tool/unproject.js";
import { dodge } from "./tool/dodge.js";
import { replicate } from "./tool/replicate.js";
import { rewind } from "./tool/rewind.js";
import { featurecollection } from "./tool/featurecollection.js";
import { merge } from "./tool/merge.js";
import { geotable } from "./tool/geotable.js";
import { proj4d3 } from "./tool/proj4d3.js";
import { addfonts } from "./tool/addfonts.js";
import { choro } from "./tool/choro.js";
import { typo } from "./tool/typo.js";
import { random } from "./tool/random.js";
import { radius } from "./tool/radius.js";
import { dotstogrid } from "./tool/dotstogrid.js";
import { symbols } from "./tool/symbols.js";
import { grid } from "./tool/grid.js";
export let tool = {
  addfonts,
  rewind,
  featurecollection,
  merge,
  geotable,
  proj4d3,
  dissolve,
  centroid,
  project,
  unproject,
  dodge,
  flattendots,
  replicate,
  ridge,
  choro,
  typo,
  random,
  radius,
  dotstogrid,
  symbols,
  grid,
  polygonstorandompoints,
};

// Legend
import { circles_nested } from "./legend/circles-nested";
import { circles } from "./legend/circles";
import { squares } from "./legend/squares";
import { squares_nested } from "./legend/squares-nested";
import { circles_half } from "./legend/circles-half.js";
import { spikes } from "./legend/spikes";
import { mushrooms } from "./legend/mushrooms";
import { choro_vertical } from "./legend/choro-vertical";
import { choro_horizontal } from "./legend/choro-horizontal";
import { typo_vertical } from "./legend/typo-vertical";
import { typo_horizontal } from "./legend/typo-horizontal";
import { symbol_vertical } from "./legend/symbol-vertical";
import { symbol_horizontal } from "./legend/symbol-horizontal";
import { box } from "./legend/box";
import { gradient_vertical } from "./legend/gradient-vertical";

export let legend = {
  gradient_vertical,
  circles,
  squares,
  squares_nested,
  circles_nested,
  circles_half,
  choro_vertical,
  choro_horizontal,
  typo_vertical,
  typo_horizontal,
  gradient_vertical,
  box,
  spikes,
  mushrooms,
  symbol_vertical,
  symbol_horizontal,
};

// effects
import { blur } from "./effect/blur.js";
import { shadow } from "./effect/shadow.js";
import { radialGradient } from "./effect/radialgradient.js";
import { clipPath } from "./effect/clippath.js";
export let effect = {
  blur,
  shadow,
  radialGradient,
  clipPath,
};

// grid

// import { arbitrary } from "./grid/arbitrary.js";
// import { diamond } from "./grid/diamond.js";
// import { dot } from "./grid/dot.js";
// import { h3 } from "./grid/h3.js";
// import { hexbin } from "./grid/hexbin.js";
// import { square } from "./grid/square.js";
// import { triangle } from "./grid/triangle.js";
// import { count } from "./grid/count.js";
// import { intersectpolys as intersect } from "./grid/intersect.js";
// export let grid = {
//grid,
// arbitrary,
// diamond,
// dot,
// h3,
// hexbin,
// square,
// triangle,
//   count,
//   intersect,
// };

// main
export { draw } from "./container/draw";
export { view } from "./container/view";
export { create } from "./container/create";
export { graticule } from "./mark/graticule.js";
export { header } from "./mark/header.js";
export { north } from "./mark/north.js";
export { scalebar } from "./mark/scalebar.js";
export { text } from "./mark/text.js";
export { circle } from "./mark/circle.js";
export { contour } from "./mark/contour.js";
export { square } from "./mark/square.js";
export { spike } from "./mark/spike.js";
export { footer } from "./mark/footer.js";
export { outline } from "./mark/outline.js";
export { path } from "./mark/path.js";
export { render } from "./container/render";
export { exportSVG, exportPNG } from "./container/export";
export { tile } from "./mark/tile.js";
export { halfcircle } from "./mark/halfcircle.js";
export { symbol } from "./mark/symbol.js";
export { tissot } from "./mark/tissot.js";
export { rhumbs } from "./mark/rhumbs.js";
export { earth } from "./mark/earth.js";
export { empty } from "./mark/empty.js";

// Plot
export { plot } from "./plot/plot.js";

// Update
import { attr } from "./update/attr.js";
export let update = {
  attr,
};

// Proj
import * as d3geo from "d3-geo";
import * as d3geoprojection from "d3-geo-projection";
import * as d3geoppolygon from "d3-geo-polygon";
export let proj = Object.assign({}, d3geo, d3geoprojection, d3geoppolygon);
