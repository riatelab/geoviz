import { create } from "../container/create";
import { render } from "../container/render";
import { typo } from "../tool/typo";
import { typo_vertical } from "../legend/typo-vertical";
import { typo_horizontal } from "../legend/typo-horizontal";
import { implantation, unique } from "../helpers/utils";
import { getsize } from "../helpers/getsize.js";

/**
 * @function plot/proptypo
 * @description With the `plot({type = "proptypo"})` function, you can quickly draw a proportional symbols with qualitative colors (hues)<br/><br/>
 * @see {@link https://observablehq.com/@neocartocnrs/prop}
 * @property {object} data - GeoJSON FeatureCollection. Use data to be able to iterate
 * @property {string} var1 - a variable name in a geoJSON containig numeric values (absolute quantitative data).
 * @property {string} var2 - a variable name in a geoJSON containig numeric values (relative quantitative data. e.g. %).
 * @property {string} [var] - If you set var instead of var1 and var2, then the same variable is mapped twice in two different ways.
 * @property {string} [symbol = "circle"] - choice of the mark to plot ("circle", "spike", "halfcircle")
 * @property {number} [k = 50] - size of the largest symbol
 * @property {number} [fixmax = null] - value matching the symbol with value = k . Setting this value is useful for making maps comparable with each other.
 * @property {boolean} [dodge = false] - to avoid circle overlap (noot relevant fot other marks)
 * @property {number} [width = 30] - a number defining the width of the spikes
 * @property {number} [straight = 0] - a number between 0 and 1 defining the curve of the spikes. 0 = curved ; 1 = straight
 * @property {string|array} [colors] - an array of colors or name of a color palette available in [dicopal](https://observablehq.com/@neocartocnrs/dicopal-library)
 * @property {array} [order] - an array of values qualitative values.
 * @property {boolean} [alphabetical = true] - to order the items in the legend in alphabetical order
 * @property {string|boolean} [missing = "white"] - missing data color
 * @property {*} [*] - You can also modify numerous parameters to customize the map. For example: `strokeWidth: 0.3`.
 * @property {boolean} [legend = true] - boolean to add or not the legend
 * @property {string} [leg1_type = "nested"] - legend style ("nested" or "separate")
 * @property {string} [leg2_type = "vertical"] - legend style ("vertical" or "horizontal")
 * @property {array} [leg1_pos = [10, 10]] - position of the legend
 * @property {*} [leg1_*] - You can also modify a wide range of parameters to customize the legend. To do this, you can use all the parameters of the [legend.circles_nested](#legend/circles_nested), [legend.circles_half](#legend/circles_half), [legend.circles_nested](#legend/circles_nested) and [legend.spikes](#legend/spikes) functions with the prefix `"leg1_"`. For example: `leg1_values_fill: "red"`.
 * @property {*} [leg2_*] - You can also modify a wide range of parameters to customize the legend (choro). To do this, you can use all the parameters of the [legend.typo_horizontal](#legend/typo_horizontal) and [legend.typo_vertical](#legend/typo_vertical) functions with the prefix `"leg2_"`. For example: `leg2_missing_text: "not available"`.
 * @example // Usage
 * geoviz.plot({type:"propchoro", data: world, var1: "pop", var2: "gdppc"})
 */

export function plot_proptypo(arg1, arg2) {
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
    symbol: "circle",
    straight: 0, // spikes
    width: 30, // spikes
    id: unique(),
    missing: "white",
    fillOpacity: 1,
    stroke: "white",
    k: 50,
    fixmax: null,
    leg1_type: "nested",
    leg1_pos: [10, 10],
    leg2_pos: undefined,
    leg2_type: "vertical",
  };

  opts = { ...opts, ...options };
  let ids = `#${opts.id}`;

  // Check var
  if (opts.var && !opts.var1 & !opts.var2) {
    opts.var1 = opts.var;
    opts.var2 = opts.var;
  }

  // Filter
  opts.data.features.filter((d) => d.properties["var1"] != undefined);

  // Titles
  opts.leg1_title = opts.leg1_title ? opts.leg1_title : opts.var1 || opts.var;
  opts.leg2_title = opts.leg2_title ? opts.leg2_title : opts.var2 || opts.var;

  // BASEMAP

  if (implantation(opts.data) == 3 && newcontainer) {
    svg.path({ datum: opts.data, fill: "#CCC", fillOpacity: 0.2 });
  }

  if (opts.symbol == "square") {
    opts.side = opts.var1;
  }
  if (opts.symbol == "spike") {
    opts.height = opts.var1;
  }
  if (opts.symbol == "circle") {
    opts.r = opts.var1;
  }
  if (opts.symbol == "halfcircle") {
    opts.r = opts.var1;
  }

  // CLASSIFY
  opts.missing_fill = opts.missing;
  let classif = typo(
    opts.order || opts["data"].features.map((d) => d.properties[opts.var2]),
    Object.fromEntries(
      Object.entries(opts).filter(([key]) =>
        ["colors", "missing", "missing_fill"].includes(key)
      )
    )
  );

  opts.fill = (d) => classif.colorize(d.properties[opts.var2]);

  if (classif.nodata == 0 && opts.missing !== true) {
    opts.missing = false;
  }

  let layeropts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 3) != "leg")
    .forEach((d) => Object.assign(layeropts, { [d]: opts[d] }));

  // CIRCLES

  switch (opts.symbol) {
    case "circle":
      svg.circle(layeropts);
      break;
    case "square":
      svg.square(layeropts);
      break;
    case "spike":
      svg.spike(layeropts);
      break;
    case "halfcircle":
      svg.halfcircle(layeropts);
      break;
  }

  // Legend
  if (opts.legend) {
    // PRO SYMBOLS
    let legopts = {};
    Object.keys(opts)
      .filter(
        (str) =>
          str.slice(0, 5) == "leg1_" || ["k", "fixmax", "id"].includes(str)
      )
      .forEach((d) =>
        Object.assign(legopts, {
          [d.slice(0, 5) == "leg1_" ? d.slice(5) : d]: opts[d],
        })
      );
    legopts.id = "leg_" + legopts.id;
    legopts.data = opts.data.features.map((d) => +d.properties[opts.var1]);

    legopts.spike_width = legopts.spike_width
      ? legopts.spike_width
      : opts.width;

    legopts.spike_straight = legopts.spike_straight
      ? legopts.spike_straight
      : opts.straight;

    switch (opts.symbol) {
      case "circle":
        opts.leg1_type == "nested"
          ? svg.legend.circles_nested(legopts)
          : svg.legend.circles(legopts);
        break;
      case "square":
        opts.leg1_type == "nested"
          ? svg.legend.squares_nested(legopts)
          : svg.legend.squares(legopts);
        break;
      case "spike":
        svg.legend.spikes(legopts);
        break;
      case "halfcircle":
        svg.legend.circles_half(legopts);
        break;
    }

    if (opts.leg2_pos == undefined) {
      const size = getsize(svg.selectAll(`#${legopts.id}`));
      console.log(size);
      opts.leg2_pos = [opts.leg1_pos[0], opts.leg1_pos[1] + size.height + 5];
    }

    // CHORO
    let legopts2 = {};
    Object.keys(opts)
      .filter((str) => str.slice(0, 5) == "leg2_" || ["missing"].includes(str))
      .forEach((d) =>
        Object.assign(legopts2, {
          [d.slice(0, 5) == "leg2_" ? d.slice(5) : d]: opts[d],
        })
      );
    let funclegend =
      opts.leg2_type == "vertical" ? typo_vertical : typo_horizontal;
    legopts2.id = "leg_" + legopts2.id + "_choro";
    funclegend(svg, {
      ...legopts2,
      missing: opts.missing === false ? false : true,
      missing_fill: opts.missing,
      alphabetical: opts.alphabetical,
      types: classif.types,
      colors: classif.colors,
    });

    ids = [`#${opts.id}`, `#${legopts.id}`, `#${legopts2.id}`];
    console.log(ids);
  }

  if (newcontainer) {
    return render(svg);
  } else {
    return ids;
  }
}
