// Marks
import { graticule } from "./mark/graticule";
import { minimap } from "./mark/minimap";
import { contour } from "./mark/contour";
import { rhumbs } from "./mark/rhumbs";
import { tissot } from "./mark/tissot";
import { outline } from "./mark/outline";
import { sketch } from "./mark/sketch";
import { path } from "./mark/path";
import { text } from "./mark/text";
import { circle } from "./mark/circle";
import { halfcircle } from "./mark/halfcircle";
import { spike } from "./mark/spike";
import { tile } from "./mark/tile";
import { header } from "./mark/header";
import { footer } from "./mark/footer";
import { scalebar } from "./mark/scalebar";
import { north } from "./mark/north";
import { square } from "./mark/square";
import { symbol } from "./mark/symbol";
import { earth } from "./mark/earth";
import { empty } from "./mark/empty";
import { pattern } from "./mark/pattern";

// Legends
import { box } from "./legend/box";
import { choro_horizontal } from "./legend/choro-horizontal";
import { gradient_vertical } from "./legend/gradient-vertical";
import { choro_vertical } from "./legend/choro-vertical";
import { typo_horizontal } from "./legend/typo-horizontal";
import { typo_vertical } from "./legend/typo-vertical";
import { spikes } from "./legend/spikes";
import { circles } from "./legend/circles";
import { circles_nested } from "./legend/circles-nested";
import { mushrooms } from "./legend/mushrooms";
import { squares as legsquare } from "./legend/squares";
import { squares_nested as legsquare_nested } from "./legend/squares-nested";
import { symbol_horizontal } from "./legend/symbol-horizontal";
import { symbol_vertical } from "./legend/symbol-vertical";

// Effects
import { blur } from "./effect/blur";
import { clipPath } from "./effect/clippath";
import { radialGradient } from "./effect/radialgradient";
import { shadow } from "./effect/shadow";

// Symbology
import { choro } from "./thematic/choro";
import { smooth } from "./thematic/smooth";
import { typo } from "./thematic/typo";
import { prop } from "./thematic/prop";
import { propchoro } from "./thematic/propchoro";
import { proptypo } from "./thematic/proptypo";
import { picto } from "./thematic/picto";
import { bertin } from "./thematic/bertin";
import { gridprop } from "./thematic/gridprop";
import { gridchoro } from "./thematic/gridchoro";
import { dotdensity } from "./thematic/dotdensity";

/**
 * @function plot
 * @description The `plot()` function in geoviz allows you to call all available layer types through a single entry point. The layer type must be specified using the `type` parameter.
 * <br/><br/>
 * Example: `geoviz.plot({ type: "graticule", step: 30 })`
 *
 * @property {string} choro - Usage: `geoviz.plot({type: "choro", ...})` or `{type: "choropleth"}`. See [choro](#choro)
 * @property {string} typo - Usage: `geoviz.plot({type: "typo", ...})` or `{type: "typology"}`. See [typo](#typo)
 * @property {string} prop - Usage: `geoviz.plot({type: "prop", ...})`. See [prop](#prop)
 * @property {string} propchoro - Usage: `geoviz.plot({type: "propchoro", ...})`. See [propchoro](#propchoro)
 * @property {string} proptypo - Usage: `geoviz.plot({type: "proptypo", ...})`. See [proptypo](#proptypo)
 * @property {string} gridprop - Usage: `geoviz.plot({type: "gridprop", ...})`. See [gridprop](#gridprop)
 * @property {string} gridchoro - Usage: `geoviz.plot({type: "gridchoro", ...})`. See [gridchoro](#gridchoro)
 * @property {string} dotdensity - Usage: `geoviz.plot({type: "dotdensity", ...})`. See [dotdensity](#dotdensity)
 * @property {string} smooth - Usage: `geoviz.plot({type: "smooth", ...})` or `{type: "heatmap"}`. See [smooth](#smooth)
 * @property {string} contour - Usage: `geoviz.plot({type: "contour", ...})`. See [contour](#contour)
 * @property {string} picto - Usage: `geoviz.plot({type: "picto", ...})`. See [picto](#picto)
 * @property {string} bertin - Usage: `geoviz.plot({type: "bertin", ...})`. See [bertin](#bertin)
 *
 * @property {string} outline - Usage: `geoviz.plot({type: "outline", ...})`. See {@link outline}
 * @property {string} graticule - Usage: `geoviz.plot({type: "graticule", ...})`. See {@link graticule}
 * @property {string} rhumbs - Usage: `geoviz.plot({type: "rhumbs", ...})` or `{type: "rhumb"}`. See {@link rhumbs}
 * @property {string} tissot - Usage: `geoviz.plot({type: "tissot", ...})`. See {@link tissot}
 * @property {string} minimap - Usage: `geoviz.plot({type: "minimap", ...})` or `{type: "location"}`. See {@link minimap}
 * @property {string} path - Usage: `geoviz.plot({type: "path", ...})` or `{type: "base"}` or `{type: "simple"}`. See {@link path}
 * @property {string} text - Usage: `geoviz.plot({type: "text", ...})` or `{type: "label"}`. See {@link text}
 * @property {string} circle - Usage: `geoviz.plot({type: "circle", ...})`. See {@link circle}
 * @property {string} symbol - Usage: `geoviz.plot({type: "symbol", ...})`. See {@link symbol}
 * @property {string} square - Usage: `geoviz.plot({type: "square", ...})`. See {@link square}
 * @property {string} halfcircle - Usage: `geoviz.plot({type: "halfcircle", ...})`. See {@link halfcircle}
 * @property {string} spike - Usage: `geoviz.plot({type: "spike", ...})`. See {@link spike}
 * @property {string} tile - Usage: `geoviz.plot({type: "tile", ...})`. See {@link tile}
 * @property {string} earth - Usage: `geoviz.plot({type: "earth", ...})`. See {@link earth}
 * @property {string} sketch - Usage: `geoviz.plot({type: "sketch", ...})`. See {@link sketch}
 * @property {string} empty - Usage: `geoviz.plot({type: "empty", ...})`. See {@link empty}
 * @property {string} pattern - Usage: `geoviz.plot({type: "pattern", ...})` or `{type: "hatch"}`. See {@link pattern}
 *
 * @property {string} header - Usage: `geoviz.plot({type: "header", ...})`. See {@link header}
 * @property {string} footer - Usage: `geoviz.plot({type: "footer", ...})`. See {@link footer}
 * @property {string} scalebar - Usage: `geoviz.plot({type: "scalebar", ...})`. See {@link scalebar}
 * @property {string} north - Usage: `geoviz.plot({type: "north", ...})`. See {@link north}
 *
 * @property {string} leg_box - Usage: `geoviz.plot({type: "leg_box", ...})` or `{type: "legbox"}`. See [legend.box](#legend/box)
 * @property {string} leg_choro_horizontal - Usage: `geoviz.plot({type: "leg_choro_horizontal", ...})`. See [legend.choro_horizontal](#legend/choro_horizontal)
 * @property {string} leg_choro_vertical - Usage: `geoviz.plot({type: "leg_choro_vertical", ...})` or `{type: "leg_choro"}`. See [legend.choro_vertical](#legend/choro_vertical)
 * @property {string} leg_typo_horizontal - Usage: `geoviz.plot({type: "leg_typo_horizontal", ...})`. See [legend.typo_horizontal](#legend/typo_horizontal)
 * @property {string} leg_typo_vertical - Usage: `geoviz.plot({type: "leg_typo_vertical", ...})` or `{type: "leg_typo"}`. See [legend.typo_vertical](#legend/typo_vertical)
 * @property {string} leg_gradient_vertical - Usage: `geoviz.plot({type: "leg_gradient_vertical", ...})` or `{type: "leg_gradient"}`. See [legend.gradient_vertical](#legend/gradient_vertical)
 * @property {string} leg_spikes - Usage: `geoviz.plot({type: "leg_spikes", ...})`. See [legend.spikes](#legend/spikes)
 * @property {string} leg_circles - Usage: `geoviz.plot({type: "leg_circles", ...})`. See [legend.circles](#legend/circles)
 * @property {string} leg_circles_nested - Usage: `geoviz.plot({type: "leg_circles_nested", ...})`. See [legend.circles_nested](#legend/circles_nested)
 * @property {string} leg_mushrooms - Usage: `geoviz.plot({type: "leg_mushrooms", ...})`. See [legend.mushrooms](#legend/mushrooms)
 * @property {string} leg_square - Usage: `geoviz.plot({type: "leg_square", ...})`. See [legend.squares](#legend/squares)
 * @property {string} leg_square_nested - Usage: `geoviz.plot({type: "leg_square_nested", ...})`. See [legend.squares_nested](#legend/squares_nested)
 * @property {string} leg_symbol_vertical - Usage: `geoviz.plot({type: "leg_symbol_vertical", ...})`. See [legend.symbol_vertical](#legend/symbol_vertical)
 * @property {string} leg_symbol_horizontal - Usage: `geoviz.plot({type: "leg_symbol_horizontal", ...})`. See [legend.symbol_horizontal](#legend/symbol_horizontal)
 *
 * @property {string} effect_clipPath - Usage: `geoviz.plot({type: "effect_clipPath", ...})` or `{type: "clipPath"}`. See [effect.clipPath](#effect/clipPath)
 * @property {string} effect_blur - Usage: `geoviz.plot({type: "effect_blur", ...})` or `{type: "blur"}`. See [effect.blur](#effect/blur)
 * @property {string} effect_shadow - Usage: `geoviz.plot({type: "effect_shadow", ...})` or `{type: "shadow"}`. See [effect.shadow](#effect/shadow)
 * @property {string} effect_radialGradient - Usage: `geoviz.plot({type: "effect_radialGradient", ...})` or `{type: "radialGradient"}`. See [effect.radialGradient](#effect/radialGradient)
 *
 * @property {*} [svg_*] - Parameters of the SVG container if the layer is created outside a container (e.g. `svg_width`)
 *
 * @example
 * let svg = geoviz.create({projection: d3.geoNaturalEarth1()})
 * svg.plot({ type: "outline" })
 * svg.plot({ type: "graticule", step: 30, stroke: "white" })
 * svg.plot({ type: "path", datum: world, fill: "white", fillOpacity: 0.3 })
 * svg.plot({ type: "header", text: "Hello World" })
 * return svg.render()
 */

export async function plot(arg1, arg2) {
  // Options
  let options =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? arg1
      : arg2;

  if (options?.map && options?.id) {
    const g = createLayer({
      map: options.map,
      id: options.id,
      before: options.before,
      after: options.after,
    });
  }

  switch (options.type) {
    case "rhumbs":
    case "rhumb":
      return rhumbs(arg1, arg2);
      break;
    case "hatch":
    case "pattern":
      return pattern(arg1, arg2);
      break;
    case "tissot":
      return tissot(arg1, arg2);
      break;
    case "graticule":
      return graticule(arg1, arg2);
      break;
    case "minimap":
    case "location":
    case "locationmap":
      return minimap(arg1, arg2);
      break;
    case "empty":
      return empty(arg1, arg2);
      break;
    case "outline":
      return outline(arg1, arg2);
      break;
    case "path":
    case "base":
    case "simple":
    case "layer":
    case undefined:
      return await path(arg1, arg2);
      break;
    case "text":
    case "label":
      return text(arg1, arg2);
      break;
    case "circle":
      return circle(arg1, arg2);
      break;
    case "symbol":
      return symbol(arg1, arg2);
      break;
    case "square":
      return square(arg1, arg2);
      break;
    case "sketch":
      return sketch(arg1, arg2);
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
    case "earth":
      return earth(arg1, arg2);
      break;
    case "contour":
      return contour(arg1, arg2);
    case "smooth":
    case "heatmap":
      return smooth(arg1, arg2);
      break;
    case "dotdensity":
      return dotdensity(arg1, arg2);
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
      return choro_vertical(arg1, arg2);
      break;

    case "leg_typo_horizontal":
    case "legtypohorizontal":
      return typo_horizontal(arg1, arg2);
      break;
    case "leg_typo_vertical":
    case "legtypovertical":
    case "leg_typo":
    case "legtypo":
      return typo_vertical(arg1, arg2);
      break;
    case "leg_gradient_vertical":
    case "leggradientvertical":
    case "leg_gradient":
    case "leggradient":
      return gradient_vertical(arg1, arg2);
      break;
    case "leg_square":
    case "leg_squares":
    case "legsquare":
    case "legsquares":
      return legsquare(arg1, arg2);
      break;
    case "leg_square_nested":
    case "leg_squares_nested":
    case "legsquarenested":
    case "legsquaresnested":
      return legsquare_nested(arg1, arg2);
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
    case "leg_symbol_vertical":
    case "legsymbolvertical":
    case "legsymbolsvertical":
      return symbol_vertical(arg1, arg2);
      break;
    case "leg_symbol_horizontal":
    case "legsymbolhorizontal":
    case "legsymbolshorizontal":
      return symbol_horizontal(arg1, arg2);
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
      return choro(arg1, arg2);
      break;
    case "typo":
    case "typology":
      return typo(arg1, arg2);
      break;
    case "prop":
      return prop(arg1, arg2);
      break;
    case "gridprop":
      return gridprop(arg1, arg2);
      break;
    case "gridchoro":
      return gridchoro(arg1, arg2);
      break;
    case "propchoro":
      return propchoro(arg1, arg2);
      break;
    case "proptypo":
      return proptypo(arg1, arg2);
      break;
    case "picto":
      return picto(arg1, arg2);
      break;
    case "bertin":
      return bertin(arg1, arg2);
      break;
  }
}
