import { choro } from "../tool/choro";
import { create } from "../container/create";
import { path } from "../mark/path";
import { render } from "../container/render";
import { choro_vertical } from "../legend/choro-vertical";
import { choro_horizontal } from "../legend/choro-horizontal";
import { implantation, columns, unique } from "../helpers/utils";

/**
 * @function plot/choro
 * @description With the `plot({type = "choro"})` function, you can quickly draw a choropleth map.<br/><br/>
 * ![choro](img/thumb_choro.svg)
 * @see {@link https://observablehq.com/@neocartocnrs/choropleth}
 * @property {object} data - GeoJSON FeatureCollection. Use data to be able to iterate
 * @property {string} var - a variable name in a geoJSON containig numeric values. You can also use `fill` or `stroke` argument.
 * @property {string} [method = quantile] - classification method ('quantile', 'q6', 'equal', 'jenks', 'msd', 'geometric', 'headtail', 'pretty', 'arithmetic' or 'nestedmeans').
 * @property {number} [nb = 6] - number of classes
 * @property {array} [breaks] - you can define classes manually. In this case, the parameters `nb` and `method` are not taken into account.
 * @property {string|array} [colors] - an array of colors or name of a color palette available in [dicopal](https://observablehq.com/@neocartocnrs/dicopal-library). For example "ArmyRose_7", "Earth_7", "Fall_7", "Geyser_7", "TealRose_7", "Temps_7", "Tropic_7", "BluGrn_7", "BluYl_7", "BrwnYl_7", "BurgYl_7", "Burg_7", "DarkMint_7", "Emrld_7", "Magenta_7", "Mint_7", "OrYel_7", "Peach_7", "PinkYl_7", "PurpOr_7"...
 * @property {boolean} [reverse = false] - reverse the color palette
 * @property {string|boolean} [missing = "white"] - missing data color
 * @property {boolean} [legend = true] - boolean to add or not the legend
 * @property {string} [leg_type = "vertical"] - legend orientation ("horizontal" or "vertical")
 * @property {array} [leg_pos = [10, 10]] - position of the legend
 * @property {*} [*] - You can also modify numerous parameters to customize the map. To do this, you can use all the parameters of the [path](#path) and [tool.choro](#tool/choro) functions. For example: `strokeWidth: 0.3`.
 * @property {*} [leg_*] - You can also modify a wide range of parameters to customize the legend. To do this, you can use all the parameters of the [legend.choro_horizontal](#legend/choro_horizontal) and [legend.choro_vertical](#legend/choro_vertical) functions with the prefix `"leg_"`. For example: `leg_missing_text: "not available"` or `leg_values_fill: "red"`.
 * @property {*} [svg_*]  - *parameters of the svg container created if the layer is not called inside a container (e.g svg_width)*
 * @example // Usage
 * geoviz.plot({type:"choro", data: world, var: "gdppc"})
 */

export function plot_choro(arg1, arg2) {
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;

  let options = newcontainer ? arg1 : arg2;

  // Default values
  let opts = {
    legend: true,
    id: unique(),
    missing: "white",
    leg_type: "vertical",
    leg_pos: [10, 10],
  };

  opts = { ...opts, ...options };

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
          "breaks",
          "colors",
          "nb",
          "k",
          "reverse",
          "middle",
          "precision",
          "missing_fill",
        ].includes(key),
      ),
    ),
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
          str.slice(0, 4) == "leg_" ||
          ["k", "fixmax", "missing", "id"].includes(str),
      )
      .forEach((d) =>
        Object.assign(legopts, {
          [d.slice(0, 4) == "leg_" ? d.slice(4) : d]: opts[d],
        }),
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
    ids = [`#${opts.id}`, `#${legopts.id}`];
  }

  if (newcontainer) {
    return render(svg);
  } else {
    return ids;
  }
}
