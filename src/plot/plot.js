// Marks
import { graticule } from "../mark/graticule";
import { outline } from "../mark/outline";
import { path } from "../mark/path";
import { text } from "../mark/text";
import { circle } from "../mark/circle";
import { halfcircle } from "../mark/halfcircle";
import { spike } from "../mark/spike";
import { tile } from "../mark/tile";
import { header } from "../mark/header";
import { footer } from "../mark/footer";
import { scalebar } from "../mark/scalebar";
import { north } from "../mark/north";

// Legends
import { box } from "../legend/box";
import { choro_horizontal } from "../legend/choro-horizontal";
import { choro_vertical } from "../legend/choro-vertical";
import { typo_horizontal } from "../legend/typo-horizontal";
import { typo_vertical } from "../legend/typo-vertical";
import { spikes } from "../legend/spikes";

import { circles } from "../legend/circles";
import { circles_nested } from "../legend/circles-nested";
import { mushrooms } from "../legend/mushrooms";

// Symbology
import { plot_choro } from "./plot_choro";

export function plot(arg1, arg2) {
  // Options
  let options =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? arg1
      : arg2;

  switch (options.type) {
    case "graticule":
      return graticule(arg1, arg2);
      break;
    case "outline":
      return outline(arg1, arg2);
      break;
    case "path":
      return path(arg1, arg2);
      break;
    case "text":
      return text(arg1, arg2);
      break;
    case "circle":
      return circle(arg1, arg2);
      break;
    case "halfcircle":
      return halfcircle(arg1, arg2);
      break;
    case "spike":
      return spike(arg1, arg2);
      break;
    case "tile":
      return tile(arg1, arg2);
      break;
    case "header":
      return header(arg1, arg2);
      break;
    case "footer":
      return footer(arg1, arg2);
      break;
    case "scalebar":
      return scalebar(arg1, arg2);
      break;
    case "north":
      return north(arg1, arg2);
      break;
    case "leg_box":
    case "legbox":
      return box(arg1, arg2);
      break;
    case "leg_choro_horizontal":
    case "legchorohorizontal":
      return choro_horizontal(arg1, arg2);
      break;
    case "leg_choro_vertical":
    case "legchorovertical":
    case "leg_choro":
    case "legchoro":
      return newcontainer
        ? choro_vertical(options)
        : choro_vertical(arg1, arg2);
      break;
    case "leg_typo_horizontal":
    case "legtypohorizontal":
      return typo_horizontal(arg1, arg2);
      break;
    case "leg_typo_vertical":
    case "legtypovertical":
    case "leg_typo":
    case "legtypo":
      return newcontainer ? typo_vertical(options) : typo_vertical(arg1, arg2);
      break;
    case "leg_spikes":
    case "leg_spike":
    case "legspike":
    case "legspikes":
      return spikes(arg1, arg2);
      break;
    case "leg_circles":
    case "leg_circle":
    case "legcircle":
    case "legcircles":
      return circles(arg1, arg2);
      break;
    case "leg_circles_nested":
    case "leg_circle_nested":
    case "legcirclenested":
    case "legcirclesnested":
      return circles_nested(arg1, arg2);
      break;
    case "leg_mushrooms":
    case "leg_mushroom":
    case "legmushrooms":
    case "legmushroom":
      return mushrooms(arg1, arg2);
      break;
    case "choro":
      return plot_choro(arg1, arg2);
      break;
  }
}
