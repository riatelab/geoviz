import { contour } from "../mark/contour";

export function plot_smooth(arg1, arg2) {
  const newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups;

  const defaults = {
    stroke: "white",
    strokeOpacity: 0.8,
    strokeWidth: 0.3,
    tip: undefined,
    tipstyle: undefined,
    fill: undefined,
    colors: "RdPu",
    opacity: undefined,
    fillOpacity: 0.6,
    shadow: true,
    legend: true,
    leg_missing: false,
    leg_pos: [10, 10],
  };

  const options = {
    ...defaults,
    ...(newcontainer ? arg1 : arg2),
  };

  return newcontainer ? contour(options) : contour(arg1, options);
}
