// Container
import { create } from "./container/create";
import { render } from "./container/render";
export let container = {
  create,
  render,
};

// Tool
import { rewind } from "./tool/rewind";
import { featurecollection } from "./tool/featurecollection";
import { merge } from "./tool/merge";
import { geotable } from "./tool/geotable";
import { proj4d3 } from "./tool/proj4d3";
export let tool = {
  rewind,
  featurecollection,
  merge,
  geotable,
  proj4d3,
};

// Transform
import { centroid } from "./transform/centroid";
import { ridge } from "./transform/ridge";
import { dissolve } from "./transform/dissolve";
import { project } from "./transform/project";
import { unproject } from "./transform/unproject";
import { dodge } from "./transform/dodge";
import { replicate } from "./transform/replicate";
export let transform = {
  dissolve,
  centroid,
  project,
  unproject,
  dodge,
  replicate,
  ridge,
};

// Classify
import { choro } from "./classify/choro";
import { typo } from "./classify/typo";
import { random } from "./classify/random";
import { radius } from "./classify/radius";
export let classify = {
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

// style
import { blur } from "./style/blur";
import { radialGradient } from "./style/radialgradient";
import { clippath } from "./style/clippath";
import { addfonts } from "./style/addfonts";
export let style = {
  clippath,
  blur,
  addfonts,
  radialGradient,
};

// main
export { create } from "./container/create";
export { graticule } from "./mark/graticule.js";
export { header } from "./mark/header.js";
export { north } from "./mark/north.js";
export { scalebar } from "./mark/scalebar.js";
export { text } from "./mark/text.js";
export { label } from "./mark/label.js";
export { circle } from "./mark/circle.js";
export { footer } from "./mark/footer.js";
export { outline } from "./mark/outline.js";
export { path } from "./mark/path.js";
export { spike } from "./layer/spike.js";
export { render } from "./container/render";
export { tile } from "./mark/tile.js";
export { triangle } from "./mark/triangle.js";
