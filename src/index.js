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

export let tool = {
  rewind,
  featurecollection,
  merge,
  geotable,
};

// Transform
import { centroid } from "./transform/centroid";
import { project } from "./transform/project";
import { dodge } from "./transform/dodge";
import { replicate } from "./transform/replicate";
export let transform = {
  centroid,
  project,
  dodge,
  replicate,
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
import { graticule } from "./layer/graticule";
import { text } from "./layer/text";
import { circle } from "./layer/circle";
import { label } from "./layer/label";
import { tile } from "./layer/tile";

import { header } from "./layer/header";
export let layer = {
  geopath,
  outline,
  graticule,
  text,
  circle,
  label,
  tile,
  header,
};

// Legend
import { circles_nested } from "./legend/circles-nested";
import { circles } from "./legend/circles";
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
};

// Filter
import { blur } from "./filter/blur";
import { clippath } from "./filter/clippath";
export let filter = {
  clippath,
  blur,
};
