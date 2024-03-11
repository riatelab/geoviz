import { choro } from "../tool/choro";
import { create } from "../container/create";
import { path } from "../mark/path";
import { render } from "../container/render";
import { choro_vertical } from "../legend/choro-vertical";
import { choro_horizontal } from "../legend/choro-horizontal";
export function plot_choro(arg1, arg2) {
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;

  // New container
  let options = newcontainer ? arg1 : arg2;
  let svg = newcontainer ? create({ domain: options.data }) : arg1;

  // Default values
  let opts = {
    // Discretization
    data: null,
    fill: undefined,
    method: "quantile",
    breaks: undefined,
    colors: "Algae",
    nb: 6,
    k: 1,
    middle: undefined,
    precision: 2,
    missing: "white",
    // Path
    projection: undefined,
    tip: undefined,
    tipstyle: undefined,
    stroke: "white",
    strokeWidth: 1,
    fillOpacity: 1,
    // Legend
    leg_type: "vertical",
    leg_pos: [10, svg.height / 2],
  };
  opts = { ...opts, ...options };

  // classif
  let classif = choro(
    opts["data"].features.map((d) => d.properties[opts.fill]),
    Object.fromEntries(
      Object.entries(opts).filter(([key]) =>
        [
          "method",
          "break",
          "colors",
          "nb",
          "k",
          "middle",
          "precision",
          "missing",
        ].includes(key)
      )
    )
  );

  // Path
  let layeropts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) != "leg_")
    .forEach((d) => Object.assign(layeropts, { [d]: opts[d] }));

  path(svg, {
    ...layeropts,
    data: layeropts["data"],
    fill: (d) => classif.colorize(d.properties[opts.fill]),
    tip: opts.tip,
  });

  // Legend

  let legopts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "leg_" || ["k", "fixmax"].includes(str))
    .forEach((d) =>
      Object.assign(legopts, {
        [d.slice(0, 4) == "leg_" ? d.slice(4) : d]: opts[d],
      })
    );

  let funclegend =
    opts.leg_type == "vertical" ? choro_vertical : choro_horizontal;
  funclegend(svg, {
    ...legopts,
    pos: opts.leg_pos,
    breaks: classif.breaks,
    colors: classif.colors,
  });

  if (newcontainer) {
    return render(svg);
  }
}
