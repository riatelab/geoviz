import { typo } from "../tool/typo";
import { create } from "../container/create";
import { path } from "../mark/path";
import { render } from "../container/render";
import { typo_vertical } from "../legend/typo-vertical";
import { typo_horizontal } from "../legend/typo-horizontal";
import { implantation, columns } from "../helpers/utils";
export function plot_typo(arg1, arg2) {
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
    missing: "white",
    leg_type: "vertical",
    leg_pos: [10, svg.height / 2],
  };
  opts = { ...opts, ...options };

  // Fill or stroke ?

  let fig = "poly";
  const figuration = implantation(opts.data);
  if (figuration == 2) {
    opts.fill = opts.fill ? opts.fill : "none";
    opts.stroke = opts.stroke ? opts.stroke : "#CCC";
  }
  if (figuration != 2) {
    opts.fill = opts.fill ? opts.fill : "#CCC";
    opts.stroke = opts.stroke ? opts.stroke : "white";
  }

  if (opts.var !== undefined) {
    if (figuration == 2) {
      fig = "line";
    }
  } else {
    const col = columns(opts.data.features.map((d) => d.properties));
    if (col.includes(opts.stroke)) {
      opts.var = opts.stroke;
      fig = "line";
    }
    if (col.includes(opts.fill)) {
      opts.var = opts.fill;
      fig = "poly";
    }
  }

  // classif
  opts.missing_fill = opts.missing;
  let classif = typo(
    opts.order || opts["data"].features.map((d) => d.properties[opts.var]),
    Object.fromEntries(
      Object.entries(opts).filter(([key]) =>
        ["colors", "missing", "missing_fill"].includes(key)
      )
    )
  );

  if (classif.nodata == 0 && opts.missing !== true) {
    opts.missing = false;
  }

  // Path
  let layeropts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) != "leg_")
    .forEach((d) => Object.assign(layeropts, { [d]: opts[d] }));

  path(svg, {
    ...layeropts,
    stroke: (d) =>
      fig == "line" ? classif.colorize(d.properties[opts.var]) : opts.stroke,
    fill: (d) =>
      fig == "poly" ? classif.colorize(d.properties[opts.var]) : opts.fill,
  });

  // Legend

  let legopts = {};
  Object.keys(opts)
    .filter(
      (str) =>
        str.slice(0, 4) == "leg_" || ["alphabetical", "missing"].includes(str)
    )
    .forEach((d) =>
      Object.assign(legopts, {
        [d.slice(0, 4) == "leg_" ? d.slice(4) : d]: opts[d],
      })
    );

  let funclegend =
    opts.leg_type == "vertical" ? typo_vertical : typo_horizontal;
  funclegend(svg, {
    ...legopts,
    missing: opts.missing === false ? false : true,
    missing_fill: opts.missing,
    alphabetical: opts.alphabetical,
    pos: opts.leg_pos,
    types: classif.types,
    colors: classif.colors,
  });

  if (newcontainer) {
    return render(svg);
  }
}
