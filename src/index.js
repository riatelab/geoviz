// xxx
export { container } from "./utils/container";
export { render } from "./utils/render";

// Tools
import { rewind } from "./utils/rewind";
import { featurecollection } from "./utils/featurecollection";
import { merge } from "./utils/merge";

export let tools = {
  rewind,
  featurecollection,
  merge,
  centroid,
};

// Tranform
import { centroid } from "./transform/centroid";
import { project } from "./transform/project";
export let transform = {
  centroid,
  project,
};

// Classify
import { choro } from "./classify/choro";
import { random } from "./classify/random";
export let classify = {
  choro,
  random,
};

// Layers
import { simple } from "./layers/simple";
import { outline } from "./layers/outline";
import { graticule } from "./layers/graticule";
import { text } from "./layers/text";
import { bubble } from "./layers/bubble";
import { datum } from "./layers/datum";
export let layers = {
  datum,
  simple,
  outline,
  graticule,
  text,
  bubble,
};

// Legend
export let legends = {};
