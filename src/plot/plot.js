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

// Effects
import { blur } from "../effect/blur";
import { clipPath } from "../effect/clippath";
import { radialGradient } from "../effect/radialgradient";
import { shadow } from "../effect/shadow";

// Symbology
import { plot_choro } from "./plot_choro";
import { plot_typo } from "./plot_typo";
import { plot_prop } from "./plot_prop";
import { plot_propchoro } from "./plot_propchoro";

/**
 * @function plot
 * @toto
 * @description The `plot()` function in geoviz allows you to call up all the layer types available in the library via a single function. To do this, you need to define the type in the parameter.
 * <br/><br/>For example: `geoviz.plot({type: "graticule", step: 30})`
 * @property {string} choro - Usage: `geoviz.plot({type: "choro", ...})` or `{type: "choropleth"}`. See [plot/choro](#plot/choro)
 * @property {string} typo - Usage: `geoviz.plot({type: "typo", ...})` or `{type: "typology"}`. See See [plot/typo](#plot/typo)
 * @property {string} prop - Usage: `geoviz.plot({type: "prop", ...}). See See [plot/prop](#plot/prop)
 * @property {string} outline - Usage: `geoviz.plot({type: "outline", ...})`. See {@link outline}
 * @property {string} graticule - Usage: `geoviz.plot({type: "graticule", ...})`. See {@link graticule}
 * @property {string} path - Usage: `geoviz.plot({type: "path", ...})` or `{type: "base"}` or `{type: "simple"}`. See {@link path}
 * @property {string} text - Usage: `geoviz.plot({type: "text", ...})` or `{type: "label"}`. See {@link text}
 * @property {string} circle - Usage: `geoviz.plot({type: "circle", ...})`. See {@link circle}
 * @property {string} halfcircle - Usage: `geoviz.plot({type: "halfcircle", ...})`. See {@link halfcircle}
 * @property {string} spike - Usage: `geoviz.plot({type: "spike", ...})`. See {@link spike}
 * @property {string} tile - Usage: `geoviz.plot({type: "tile", ...})`. See {@link tile}
 * @property {string} header - Usage: `geoviz.plot({type: "header", ...})`. See {@link header}
 * @property {string} footer - Usage: `geoviz.plot({type: "footer", ...})`. See {@link footer}
 * @property {string} scalebar - Usage: `geoviz.plot({type: "scalebar", ...})`. See {@link scalebar}
 * @property {string} north - Usage: `geoviz.plot({type: "north", ...})`. See {@link north}
 * @property {string} leg_box - Usage: `geoviz.plot({type: "leg_box", ...})` or `{type: "legbox"}`. See [legend.box](#legend/box)
 * @property {string} leg_choro_horizontal - Usage: `geoviz.plot({type: "leg_choro_horizontal", ...})` or `{type: "legchorohorizontal"}`. See [legend.choro_horizontal](#legend/choro_horizontal)
 * @property {string} leg_choro_vertical - Usage: `geoviz.plot({type: "leg_choro_vertical", ...})` or `{type: "legchorovertical"}` or `{type: "leg_choro"}` or `{type: "legchoro"}`. See [legend.choro_vertical](#legend/choro_vertical)
 * @property {string} leg_typo_horizontal - Usage: `geoviz.plot({type: "leg_typo_horizontal", ...})` or `{type: "legtypohorizontal"}`. See [legend.typo_horizontal](#legend/typo_horizontal)
 * @property {string} leg_typo_vertical - Usage: `geoviz.plot({type: "leg_typo_vertical", ...})` or `{type: "legtypovertical"}` or `{type: "leg_typo"}` or `{type: "legtypo"}`. See [legend.choro_vertical](#legend/choro_vertical)
 * @property {string} leg_spikes - Usage: `geoviz.plot({type: "leg_spikes", ...})` or `{type: "leg_spikes"}` or `{type: "legspikes"}` or `{type: "legspike"}`. See [legend.spikes](#legend/spikes)
 * @property {string} leg_circles - Usage: `geoviz.plot({type: "leg_circles", ...})` or `{type: "legcircle"}` or `{type: "legcircle"}` or `{type: "legcircles"}`. See [legend.circles](#legend/circles)
 * @property {string} leg_circle_nested - Usage: `geoviz.plot({type: "leg_circle_nested", ...})` or `{type: "legcirclenested"}` or `{type: "legcirclesnested"}`. See [legend.circles_nested](#legend/circles_nested)
 * @property {string} leg_mushrooms - Usage: `geoviz.plot({type: "leg_mushrooms", ...})` or `{type: "leg_mushroom"}` or `{type: "legmushrooms"}` or `{type: "legmushroom"}`. See [legend.mushrooms](legend/#mushrooms)
 * @property {string} effect_clipPath - Usage: `geoviz.plot({type: "effect_clipPath", ...})` or `{type: "clipPath"}`. See [effect.clipPath](#effect/clipPath)
 * @property {string} effect_blur - Usage: `geoviz.plot({type: "effect_blur", ...})` or `{type: "blur"}`. See [effect.blur](#effect/blur)
 * @property {string} effect_shadow - Usage: `geoviz.plot({type: "effect_shadow", ...})` or `{type: "shadow"}`. See [effect.shadow](#effect/shadow)
 * @property {string} effect_radialGradient - Usage: `geoviz.plot({type: "effect_radialGradient", ...})` or `{type: "radialGradient"}`. See [effect.radialGradient](#effect/radialGradient)
 * @example
 * let svg = geoviz.create({projection: d3.geoNaturalEarth1()})
 * svg.plot({ type = "outline" }) // outline layer
 * svg.plot({ type = "graticule", step:30, stroke: "white" }) // graticule layer
 * svg.plot({ type = "path", datum: world, fill: "white", fillOpacity:0.3 }) // path layer
 * svg.plot({ type = "header", text: "Hello World" }) // Map title
 * return svg.render()
 */

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
    case "base":
    case "simple":
      return path(arg1, arg2);
      break;
    case "text":
    case "label":
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
    case "blur":
    case "effect_blur":
      return blur(arg1, arg2);
      break;
    case "clipPath":
    case "effect_clipPath":
      return clipPath(arg1, arg2);
      break;
    case "radialGradient":
    case "effect_radialGradient":
      return radialGradient(arg1, arg2);
      break;
    case "shadow":
    case "effect_shadow":
      return shadow(arg1, arg2);
      break;

    case "choro":
    case "choropleth":
      return plot_choro(arg1, arg2);
      break;
    case "typo":
    case "typology":
      return plot_typo(arg1, arg2);
      break;
    case "prop":
      return plot_prop(arg1, arg2);
      break;
    case "propchoro":
      return plot_propchoro(arg1, arg2);
      break;
  }
}
