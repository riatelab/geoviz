import { create } from "../container/create";
import { render } from "../container/render";
import { unique, implantation } from "../helpers/utils";

export function bubble(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer
    ? create({ zoomable: true, domain: arg1.data || arg1.datum })
    : arg1;
  let options = newcontainer ? arg1 : arg2;

  // Additionnal default values (see also circle and lgends)
  let opts = {
    leg_type: "nested",
    leg_pos: [10, 10],
    id: unique(),
    var: 10,
    leg_id: unique(),
    leg_type: "nested",
    leg_title: "leg_title",
    leg_subtitle: "leg_subtitle",
  };

  Object.keys(opts).forEach((d) => {
    if (options[d] !== undefined) {
      opts[d] = options[d];
    }
  });

  Object.keys(options).forEach((d) => {
    opts[d] = options[d];
  });

  // Rename some fields
  const rename = (oldKey, newKey) =>
    delete Object.assign(opts, { [newKey]: opts[oldKey] })[oldKey];
  rename("var", "r");

  // Path

  if (implantation(opts.data) == 3 && newcontainer) {
    svg.path({ datum: opts.data, fill: "#CCC", fillOpacity: 0.2 });
  }

  // Circles
  let layeropts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) != "leg_")
    .forEach((d) => Object.assign(layeropts, { [d]: opts[d] }));

  svg.circle(layeropts);

  // Legend
  let legopts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "leg_" || ["k", "fixmax"].includes(str))
    .forEach((d) =>
      Object.assign(legopts, {
        [d.slice(0, 4) == "leg_" ? d.slice(4) : d]: opts[d],
      })
    );
  legopts["data"] = legopts["data"]
    ? legopts["data"]
    : opts.data.features.map((d) => d.properties[layeropts.r]);

  if (opts.leg_type == "nested") {
    svg.legend.circles_nested(legopts);
  } else {
    svg.legend.circles(legopts);
  }

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return [`#${layeropts.id}`, `#${legopts.id}`];
  }
}
