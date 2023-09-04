// Container
import { init } from "./container/init";
import { render } from "./container/render";
export let container = {
  init,
  render,
};

// Tool
import { rewind } from "./tool/rewind";
import { featurecollection } from "./tool/featurecollection";
import { merge } from "./tool/merge";

export let tool = {
  rewind,
  featurecollection,
  merge,
};

// Tranform
import { centroid } from "./transform/centroid";
import { project } from "./transform/project";
import { dodge } from "./transform/dodge";
export let transform = {
  centroid,
  project,
  dodge,
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
import { geo } from "./layer/geo";
import { outline } from "./layer/outline";
import { graticule } from "./layer/graticule";
import { text } from "./layer/text";
import { bubble } from "./layer/bubble";
import { datum } from "./layer/datum";
export let layer = {
  datum,
  geo,
  outline,
  graticule,
  text,
  bubble,
};

// Legend
import { circles_nested } from "./legend/circles-nested";
export let legend = { circles_nested };

// test
export { datatoradius } from "./helpers/datatoradius";
