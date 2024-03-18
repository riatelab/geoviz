import { typo } from "../tool/typo";
import { create } from "../container/create";
import { path } from "../mark/path";
import { render } from "../container/render";
import { typo_vertical } from "../legend/typo-vertical";
import { typo_horizontal } from "../legend/typo-horizontal";
import { implantation, columns, unique } from "../helpers/utils";

/**
 * @function plot/typo
 * @description With the `plot({type = "typo"})` function, you can quickly draw a typlogy from qualitative data.<br/><br/>
 * ![choro](img/thumb_typo.svg)
 * @see {@link https://observablehq.com/@neocartocnrs/choropleth}
 * @property {object} data - GeoJSON FeatureCollection. Use data to be able to iterate
 * @property {string} var - a variable name in a geoJSON containig numeric values. You can also use `fill` or `stroke` argument.
 * @property {string|array} [colors] - an array of colors or name of a color palette available in [dicopal](https://observablehq.com/@neocartocnrs/dicopal-library)
 * @property {array} [order] - an array of values qualitative values.
 * @property {boolean} [alphabetical = true] - to order the items in the legend in alphabetical order
 * @property {string|boolean} [missing = "white"] - missing data color
 * @property {boolean} [legend = true] - boolean to add or not the legend
 * @property {string} [leg_type = "vertical"] - legend orientation ("horizontal" or "vertical")
 * @property {array} [leg_pos = [10, 10]] - position of the legend
 * @property {*} [*] - You can also modify numerous parameters to customize the map. To do this, you can use all the parameters of the [path](#path) and [tool.typo](#tool/typo) functions. For example: `strokeWidth: 0.3`.
 * @property {*} [leg_*] - You can also modify a wide range of parameters to customize the legend. To do this, you can use all the parameters of the [legend.typo_horizontal](#legend/typo_horizontal) and [legend.typo_vertical](#legend/typo_vertical) functions with the prefix `"leg_"`. For example: `leg_missing_text: "not available"` or `leg_values_fill: "red"`.
 * @example // Usage
 * geoviz.plot({type:"typo", data: usa, var: "states"})
 */

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
    legend: true,
    id: unique(),
    missing: "white",
    leg_type: "vertical",
    leg_pos: [10, 10],
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

  let ids = `#${opts.id}`;

  // Legend

  if (opts.legend) {
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
    legopts.id = "leg_" + legopts.id;

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
    ids = [`#${opts.id}`, `#${legopts.id}`];
  }

  if (newcontainer) {
    return render(svg);
  } else {
    return ids;
  }
}
