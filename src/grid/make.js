import { square } from "./square.js";
import { dot } from "./dot.js";
import { dotgeo } from "./dotgeo.js";
import { squaregeo } from "./squaregeo.js";

export function make(svg, { step, type = "square" } = {}) {
  switch (type) {
    case "square":
      return square(step, svg.width, svg.height);
      break;
    case "dot":
      return dot(step, svg.width, svg.height);
      break;
    case "dotgeo":
      return dotgeo(step, svg.domain, svg.projection);
      break;
    case "squaregeo":
      return squaregeo(step, svg.domain, svg.projection);
      break;
  }
}
