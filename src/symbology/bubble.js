import { create } from "../container/create";
import { path } from "../mark/path";
import { circle } from "../mark/circle";
import { render } from "../container/render";
import { unique } from "../helpers/utils";
import { circles as leg_circles } from "../legend/circles";
import { circles_nested as leg_circles_nested } from "../legend/circles-nested";

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
    dorling: false,
    id: unique(),
    leg_id: unique(),
  };

  Object.keys(opts).forEach((d) => {
    if (options[d] !== undefined) {
      opts[d] = options[d];
    }
  });

  Object.keys(options).forEach((d) => {
    opts[d] = options[d];
  });

  // Circles
  let layeropts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) != "leg_")
    .forEach((d) => Object.assign(layeropts, { [d]: opts[d] }));

  circle(svg, layeropts);

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

  leg_circles(svg, legopts);

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return [`#${layeropts.id}`, `#${legopts.id}`];
  }
}
