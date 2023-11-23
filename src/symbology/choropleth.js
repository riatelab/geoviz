import { choro } from "../classify/choro";
import { create } from "../container/create";
import { geopath } from "../mark/geopath";
import { render } from "../container/render";
import { choro_vertical } from "../legend/choro-vertical";
import { choro_horizontal } from "../legend/choro-horizontal";
export function choropleth(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length == 1 && typeof arguments[0] == "object" ? true : false;
  let svg = newcontainer ? create() : arg1;
  let options = newcontainer ? arg1 : arg2;

  // Default values
  let opts = {
    // Discretization
    data: null,
    fill: undefined,
    method: "quantile",
    breaks: undefined,
    colors: undefined,
    nb: 6,
    k: 1,
    middle: undefined,
    precision: 2,
    palette: "Algae",
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

  Object.keys(opts).forEach((d) => {
    if (options[d] !== undefined) {
      opts[d] = options[d];
    }
  });

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
          "palette",
          "missing",
        ].includes(key)
      )
    )
  );

  // geometries
  geopath(svg, {
    data: opts["data"],
    fill: (d) => classif.colorize(d.properties[opts.fill]),
    tip: opts.tip,
  });
  // Legend
  let funclegend =
    opts.leg_type == "vertical" ? choro_vertical : choro_horizontal;
  funclegend(svg, {
    pos: opts.leg_pos,
    breaks: classif.breaks,
    colors: classif.colors,
  });

  if (newcontainer) {
    return render(svg);
  }
}
