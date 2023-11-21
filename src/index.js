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
export let classify = {
  choro,
  typo,
  random,
};

// Layers
import { geopath } from "./layer/geopath";
import { outline } from "./layer/outline";
import { graticule } from "./layer/graticule.js";
import { text } from "./layer/text";
import { circle } from "./layer/circle";
import { spike } from "./layer/spike";
import { label } from "./layer/label";
import { tile } from "./layer/tile";
import { header } from "./layer/header";
import { footer } from "./layer/footer";
import { scalebar } from "./layer/scalebar";
import { north } from "./layer/north";
export let layer = {
  geopath,
  outline,
  graticule,
  text,
  circle,
  label,
  tile,
  header,
  footer,
  scalebar,
  north,
  spike,
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
export { graticule } from "./layer/graticule.js";
export { header } from "./layer/header.js";
export { north } from "./layer/north.js";
export { scalebar } from "./layer/scalebar.js";
export { text } from "./layer/text.js";
export { label } from "./layer/label.js";
export { circle } from "./layer/circle.js";
export { footer } from "./layer/footer.js";
export { outline } from "./layer/outline.js";
export { geopath } from "./layer/geopath";
export { spike } from "./layer/spike";
export { render } from "./container/render";
export { tile } from "./layer/tile";
export { choropleth } from "./symbology/choropleth.js";
export { bubble } from "./symbology/bubble.js";
//export { render2 } from "./container/render2.js";
