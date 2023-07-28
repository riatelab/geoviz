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
};

// Layers
import { simple } from "./layers/simple";
import { outline } from "./layers/outline";
import { graticule } from "./layers/graticule";
import { text } from "./layers/text";
export let layers = {
  simple,
  outline,
  graticule,
  text,
};

// Legend
export let legends = {};
