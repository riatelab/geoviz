import { choro } from "../tool/choro";
import { create } from "../container/create";
import { path } from "../mark/path";
import { render } from "../container/render";
import { choro_vertical } from "../legend/choro-vertical";
import { choro_horizontal } from "../legend/choro-horizontal";
import { implantation, columns, unique } from "../helpers/utils";
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
    id: unique(),
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
  let classif = choro(
    opts["data"].features.map((d) => d.properties[opts.var]),
    Object.fromEntries(
      Object.entries(opts).filter(([key]) =>
        [
          "method",
          "break",
          "colors",
          "nb",
          "k",
          "reverse",
          "middle",
          "precision",
          "missing_fill",
        ].includes(key)
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
        str.slice(0, 4) == "leg_" ||
        ["k", "fixmax", "missing", "id"].includes(str)
    )
    .forEach((d) =>
      Object.assign(legopts, {
        [d.slice(0, 4) == "leg_" ? d.slice(4) : d]: opts[d],
      })
    );
  legopts.id = "leg_" + legopts.id;

  let funclegend =
    opts.leg_type == "vertical" ? choro_vertical : choro_horizontal;
  funclegend(svg, {
    ...legopts,
    missing: opts.missing === false ? false : true,
    missing_fill: opts.missing,
    pos: opts.leg_pos,
    breaks: classif.breaks,
    colors: classif.colors,
  });

  if (newcontainer) {
    return render(svg);
  } else {
    return [`#${opts.id}`, `#${legopts.id}`];
  }
}
