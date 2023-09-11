// Layers
import { geo } from "../layer/geo";
import { outline } from "../layer/outline";
import { graticule } from "../layer/graticule";
import { text } from "../layer/text";
import { bubble } from "../layer/bubble";
import { datum } from "../layer/datum";
import { label } from "../layer/label";

// Legend
// import { circles_nested } from "../legend/circles-nested";
// import { circles } from "../legend/circles";
// import { choro_vertical } from "../legend/choro-vertical";
// import { choro_horizontal } from "./legend/choro-horizontal";
// import { typo_vertical } from "../legend/typo-vertical";
// import { typo_horizontal } from "../legend/typo-horizontal";
// import { box } from "../legend/box";

export function add() {
  return {
    outline: function () {
      viz.layer.outline(svg, arguments[0]);
    },
  };
}
