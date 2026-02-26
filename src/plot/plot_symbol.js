import { create } from "../container/create";
import { render } from "../container/render";
import { implantation, propertiesentries } from "../helpers/utils";
import { picto } from "../helpers/picto";

/**
 * @function plot/symbol
 * @description With the `plot({type = "symbol"})` function, you can quickly draw a layer with symbols.<br/><br/>
 * ![choro](img/thumb_symbols.svg)
 * @see {@link https://observablehq.com/@neocartocnrs/symbols}
 * @property {object} data - GeoJSON FeatureCollection. Use data to be able to iterate
 * @property {string} var - a variable name in a geoJSON containig qualitative values. Or the name of a symbol.
 * @property {array} [symbols] - an array of symbols.
 * @property {boolean} [alphabetical = true] - to order the items in the legend in alphabetical order
 * @property {boolean} [legend = true] - boolean to add or not the legend
 * @property {string} [leg_type = "vertical"] - legend orientation ("horizontal" or "vertical")
 * @property {array} [leg_pos = [10, 10]] - position of the legend
 * @property {*} [*] - You can also modify numerous parameters to customize the map. To do this, you can use all the parameters of the [path](#path) and [tool.typo](#tool/typo) functions. For example: `strokeWidth: 0.3`.
 * @property {*} [leg_*] - You can also modify a wide range of parameters to customize the legend. To do this, you can use all the parameters of the [legend.typo_horizontal](#legend/typo_horizontal) and [legend.typo_vertical](#legend/typo_vertical) functions with the prefix `"leg_"`. For example: `leg_missing_text: "not available"` or `leg_values_fill: "red"`.
 * @property {*} [svg_*]  - *parameters of the svg container created if the layer is not called inside a container (e.g svg_width)*
 * @example // Usage
 * geoviz.plot({type:"symbol", data: usa, var: "states"})
 */
export async function plot_symbol(arg1, arg2) {
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;

  // New container
  let options = newcontainer ? arg1 : arg2;

  // Default values
  let opts = {
    legend: true,
    var: "star",
    rotate: 0,
    skewX: 0,
    skewY: 0,
    strokeWidth: 0.2,
    leg_type: "nested",
    leg_pos: [10, 10],
  };

  opts = { ...opts, ...options };
  let ids = `#${opts.id}`;

  // leg title
  opts.leg_title = opts.leg_title ? opts.leg_title : opts.var;

  // New container
  let svgopts = { domain: opts.data || opts.datum };
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(0, 4) == "svg_" ? d.slice(4) : d]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

  // BASEMAP

  if (implantation(opts.data) == 3 && newcontainer) {
    await svg.path({ datum: opts.data, fill: "#CCC", fillOpacity: 0.5 });
  }

  // LAYER OPTS
  opts.symbol = opts.symbol ? opts.symbol : opts.var;

  if (!opts.types) {
    if (propertiesentries(opts.data).includes(opts.var)) {
      opts.types = [
        ...new Set(opts.data.features.map((d) => d.properties[opts.var])),
      ];
    } else {
      opts.types = [opts.symbol || opts.var];
    }
  }

  let fieldtosymbol = getsymb(
    opts.order || opts.data.features.map((d) => d.properties[opts.symbol]),
    { symbols: opts.symbols, missing: opts.missing, picto },
  );

  opts.symbols = opts.symbols
    ? opts.symbols
    : opts.types.map((d) => fieldtosymbol(d));

  let layeropts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) != "leg_")
    .forEach((d) => Object.assign(layeropts, { [d]: opts[d] }));

  // SYMBOLS

  svg.symbol(layeropts);

  // Legend
  if (opts.legend) {
    let legopts = {};
    Object.keys(opts)
      .filter(
        (str) =>
          str.slice(0, 4) == "leg_" ||
          [
            "background",
            "k",
            "fixmax",
            "id",
            "alphabetical",
            "missing",
            "types",
            "symbols",
          ].includes(str),
      )
      .forEach((d) =>
        Object.assign(legopts, {
          [d.slice(0, 4) == "leg_" ? d.slice(4) : d]: opts[d],
        }),
      );

    legopts.symbol_fill = legopts.symbol_fill ? legopts.symbol_fill : opts.fill;
    legopts.symbol_stroke = legopts.symbol_stroke
      ? legopts.symbol_stroke
      : opts.stroke;
    legopts.symbol_background = legopts.symbol_background
      ? legopts.symbol_background
      : opts.background;
    legopts.symbol_scale = legopts.symbol_scale
      ? legopts.symbol_scale
      : opts.scale;
    legopts.symbol_rotate = legopts.symbol_rotate
      ? legopts.symbol_rotate
      : opts.rotate;
    legopts.symbol_skewX = legopts.symbol_skewX
      ? legopts.symbol_skewX
      : opts.skewX;
    legopts.symbol_skewY = legopts.symbol_skewY
      ? legopts.symbol_skewY
      : opts.skewY;

    opts.leg_type == "horizontal"
      ? svg.legend.symbol_horizontal(legopts)
      : svg.legend.symbol_vertical(legopts);
    ids = [`#${opts.id}`, `#${legopts.id}`];
  }

  if (newcontainer) {
    return render(svg);
  } else {
    return ids;
  }
}

function getsymb(
  data,
  { symbols = undefined, missing = "missing", picto } = {},
) {
  let arr = data.filter((d) => d !== "" && d != null && d != undefined);
  let types = Array.from(new Set(arr));
  const arrsymb = symbols || picto.slice(0, types.length).map((d) => d.name);

  const symbolmap = new Map(types.map((d, i) => [d, arrsymb[i]]));

  return function (d) {
    if (types.includes(d)) {
      return symbolmap.get(d);
    } else if (typeof missing === "string") {
      return missing;
    }
  };
}
