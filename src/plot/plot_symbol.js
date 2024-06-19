import { create } from "../container/create";
import { render } from "../container/render";
import { implantation, propertiesentries } from "../helpers/utils";
import { picto } from "../helpers/picto";

export function plot_symbol(arg1, arg2) {
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
    // straight: 0, // spikes
    // width: 30, // spikes
    // id: unique(),
    // missing: "white",
    // k: 50,
    // fixmax: null,
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
    svg.path({ datum: opts.data, fill: "#CCC", fillOpacity: 0.5 });
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
    { symbols: opts.symbols, missing: opts.missing, picto }
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
          ].includes(str)
      )
      .forEach((d) =>
        Object.assign(legopts, {
          [d.slice(0, 4) == "leg_" ? d.slice(4) : d]: opts[d],
        })
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
  { symbols = undefined, missing = "missing", picto } = {}
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
