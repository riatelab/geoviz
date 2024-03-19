import { create } from "../container/create";
import { render } from "../container/render";
import { choro } from "../tool/choro";
import { typo } from "../tool/typo";
import { implantation, columns, unique } from "../helpers/utils";

/**
 * @function plot/prop
 * @description With the `plot({type = "prop"})` function, you can quickly draw a choropleth map.<br/><br/>
 * @see {@link https://observablehq.com/@neocartocnrs/prop}
 * @property {object} data - GeoJSON FeatureCollection. Use data to be able to iterate
 * @property {string} var - a variable name in a geoJSON containig numeric values.
 * @property {string} [symbol = "circle"] - choice of the mark to plot ("circle", "spike", "halfcircle")
 * @property {number} [k = 50] - size of the largest symbol
 * @property {number} [fixmax = null] - value matching the symbol with value = k . Setting this value is useful for making maps comparable with each other.
 * @property {number} [width = 30] - a number defining the width of the spikes
 * @property {number} [straight = 0] - a number between 0 and 1 defining the curve of the spikes. 0 = curved ; 1 = straight
 * @property {boolean} [dodge = false] - to avoid circle overlap (noot relevant fot other marks)
 * @property {boolean} [legend = true] - boolean to add or not the legend
 * @property {string} [leg_type = "nested"] - legend style ("nested" or "separate")
 * @property {array} [leg_pos = [10, 10]] - position of the legend
 * @property {*} [*] - You can also modify numerous parameters to customize the map. To do this, you can use all the parameters of the [path](#path) and [tool.typo](#tool/typo) functions. For example: `strokeWidth: 0.3`.
 * @property {*} [leg_*] - You can also modify a wide range of parameters to customize the legend. To do this, you can use all the parameters of the [legend.circles_nested](#legend/circles_nested), [legend.circles_half](#legend/circles_half), [legend.circles_nested](#legend/circles_nested) and [legend.spikes](#legend/spikes) functions with the prefix `"leg_"`. For example: `leg_missing_text: "not available"` or `leg_values_fill: "red"`.
 * @example // Usage
 * geoviz.plot({type:"prop", data: world, var: "pop"})
 */

export function plot_prop(arg1, arg2) {
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
    leg_type: "nested",
    leg_pos: [10, 10],
  };

  opts = { ...opts, ...options };
  let ids = `#${opts.id}`;

  // leg title
  opts.leg_title = opts.leg_title ? opts.leg_title : opts.var;

  // BASEMAP

  if (implantation(opts.data) == 3 && newcontainer) {
    svg.path({ datum: opts.data, fill: "#CCC", fillOpacity: 0.2 });
  }

  // LAYER OPTS

  opts.r = opts.var;
  opts.height = opts.var;

  let layeropts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) != "leg_")
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
    let legopts = {};
    Object.keys(opts)
      .filter(
        (str) =>
          str.slice(0, 4) == "leg_" || ["k", "fixmax", "id"].includes(str)
      )
      .forEach((d) =>
        Object.assign(legopts, {
          [d.slice(0, 4) == "leg_" ? d.slice(4) : d]: opts[d],
        })
      );
    legopts.id = "leg_" + legopts.id;
    legopts.data = opts.data.features.map((d) => +d.properties[opts.var]);

    legopts.spike_width = legopts.spike_width
      ? legopts.spike_width
      : opts.width;

    legopts.spike_straight = legopts.spike_straight
      ? legopts.spike_straight
      : opts.straight;

    switch (opts.symbol) {
      case "circle":
        opts.leg_type == "nested"
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

    ids = [`#${opts.id}`, `#${legopts.id}`];
  }

  if (newcontainer) {
    return render(svg);
  } else {
    return ids;
  }
}
