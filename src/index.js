// Containerutils/
import { create } from "./container/create";
import { render } from "./container/render";
export let container = {
  create,
  render,
};

// Tool
import { centroid } from "./tool/centroid.js";
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
  replicate,
  ridge,
  choro,
  typo,
  random,
  radius,
};

// Legend
import { circles_nested } from "./legend/circles-nested";
import { circles } from "./legend/circles";
import { spikes } from "./legend/spikes";
import { choro_vertical } from "./legend/choro-vertical";
import { choro_horizontal } from "./legend/choro-horizontal";
import { typo_vertical } from "./legend/typo-vertical";
import { typo_horizontal } from "./legend/typo-horizontal";
import { box } from "./legend/box";
export let legend = {
  circles,
  circles_nested,
  choro_vertical,
  choro_horizontal,
  typo_vertical,
  typo_horizontal,
  box,
  spikes,
};

// Legend
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

// main
export { create } from "./container/create";
export { graticule } from "./mark/graticule.js";
export { header } from "./mark/header.js";
export { north } from "./mark/north.js";
export { scalebar } from "./mark/scalebar.js";
export { text } from "./mark/text.js";
export { circle } from "./mark/circle.js";
export { footer } from "./mark/footer.js";
export { outline } from "./mark/outline.js";
export { path } from "./mark/path.js";
export { spike } from "./layer/spike.js";
export { render } from "./container/render";
export { tile } from "./mark/tile.js";
export { triangle } from "./mark/triangle.js";

// Symbology
// import { choropleth } from "./symbology/choropleth.js";
// import { bubble } from "./symbology/bubble.js";
// export let symbology = {
//   choropleth,
//   bubble,
// };
