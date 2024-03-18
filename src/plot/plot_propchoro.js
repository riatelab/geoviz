import { create } from "../container/create";
import { render } from "../container/render";
import { choro } from "../tool/choro";
import { choro_vertical } from "../legend/choro-vertical";
import { choro_horizontal } from "../legend/choro-horizontal";
import { implantation, unique } from "../helpers/utils";
import { getsize } from "../helpers/getsize.js";

/**
 * @function plot/propchoro
 * @description With the `plot({type = "prop"})` function, you can quickly draw a choropleth map.<br/><br/>
 * @see {@link https://observablehq.com/@neocartocnrs/prop}
 * @property {object} data - GeoJSON FeatureCollection. Use data to be able to iterate
 * @property {string} var1 - a variable name in a geoJSON containig numeric values.
 * @property {string} var2 - a variable name in a geoJSON containig numeric values.
 * @property {string} [symbol = "circle"] - choice of the mark to plot ("circle", "spike", "halfcircle")
 * @property {number} [k = 50] - size of the largest symbol
 * @property {number} [fixmax = null] - value matching the symbol with value = k . Setting this value is useful for making maps comparable with each other.
 * @property {number} [width = 30] - a number defining the width of the spikes
 * @property {number} [straight = 0] - a number between 0 and 1 defining the curve of the spikes. 0 = curved ; 1 = straight
 * @property {boolean} [legend = true] - boolean to add or not the legend
 * @property {string} [leg_type = "separate"] - legend style ("nested" or "separate")
 * @property {array} [leg_pos = [10, 10]] - position of the legend
 * @property {*} [*] - You can also modify numerous parameters to customize the map. To do this, you can use all the parameters of the [path](#path) and [tool.typo](#tool/typo) functions. For example: `strokeWidth: 0.3`.
 * @property {*} [leg_*] - You can also modify a wide range of parameters to customize the legend. To do this, you can use all the parameters of the [legend.typo_horizontal](#legend/typo_horizontal) and [legend.typo_vertical](#legend/typo_vertical) functions with the prefix `"leg_"`. For example: `leg_missing_text: "not available"` or `leg_values_fill: "red"`.
 
* @example // Usage
 * geoviz.plot({type:"prop", data: world, var: "pop"})
 */

export function plot_propchoro(arg1, arg2) {
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
    k: 50,
    fixmax: null,
    leg1_type: "separate",
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

  // BASEMAP

  if (implantation(opts.data) == 3 && newcontainer) {
    svg.path({ datum: opts.data, fill: "#CCC", fillOpacity: 0.2 });
  }

  opts.r = opts.var1;
  opts.height = opts.var1;

  // CLASSIFY
  opts.missing_fill = opts.missing;
  let classif = choro(
    opts["data"].features.map((d) => d.properties[opts.var2]),
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
        ].includes(key)
      )
    )
  );

  opts.fill = (d) => classif.colorize(d.properties[opts.var2]);

  // LAYER OPTS
  let layeropts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 3) != "leg")
    .forEach((d) => Object.assign(layeropts, { [d]: opts[d] }));

  // CIRCLES

  switch (opts.symbol) {
    case "circle":
      svg.circle(layeropts);
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

    console.log(opts);

    switch (opts.symbol) {
      case "circle":
        opts.leg1_type == "nested"
          ? svg.legend.circles_nested(legopts)
          : svg.legend.circles(legopts);
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
      .filter(
        (str) =>
          str.slice(0, 5) == "leg2_" || ["missing", "id", "type"].includes(str)
      )
      .forEach((d) =>
        Object.assign(legopts2, {
          [d.slice(0, 5) == "leg2_" ? d.slice(5) : d]: opts[d],
        })
      );
    let funclegend =
      opts.leg2_type == "vertical" ? choro_vertical : choro_horizontal;

    funclegend(svg, {
      //...legopts2,
      missing: opts.missing === false ? false : true,
      missing_fill: opts.missing,
      pos: opts.leg2_pos,
      breaks: classif.breaks,
      colors: classif.colors,
    });

    legopts2.id = "leg_" + legopts2.id + "_choro";

    ids = [`#${opts.id}`, `#${legopts.id}`, `#${legopts2.id}`];
  }

  if (newcontainer) {
    return render(svg);
  } else {
    return ids;
  }
}
