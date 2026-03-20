import { geoPath, geoNaturalEarth1 } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoNaturalEarth1 });
import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash, unique } from "../helpers/utils";

export function sketch(arg1, arg2) {
  // Test if new container
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;

  // Arguments
  const options = {
    mark: "outline",
    id: unique(),
    fill: "red",
    stroke: "none",
    strokeWidth: 1,
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // New container
  let svgopts = { projection: d3.geoNaturalEarth1() };
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(0, 4) == "svg_" ? d.slice(4) : d]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

  // Warning
  if (svg.initproj == "none" && svg.warning) {
    svg.warning_message.push(`Outline mark`);
    svg.warning_message.push(
      `You must define a projection function in the SVG container`,
    );
  }

  if (svg.initproj != "none") {
    // init layer
    let layer = svg.selectAll(`#${opts.id}`).empty()
      ? svg.append("g").attr("id", opts.id).attr("data-layer", "outline")
      : svg.select(`#${opts.id}`);
    layer.selectAll("*").remove();

    // zoomable layer
    if (svg.zoomable && !svg.parent) {
      if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
        svg.zoomablelayers.push({
          mark: opts.mark,
          id: opts.id,
        });
      } else {
        let i = svg.zoomablelayers.indexOf(
          svg.zoomablelayers.find((d) => d.id == opts.id),
        );
        svg.zoomablelayers[i] = {
          mark: opts.mark,
          id: opts.id,
        };
      }
    }

    // Manage options
    let entries = Object.entries(opts).map((d) => d[0]);
    const layerattr = entries.filter((d) => !["mark", "id"].includes(d));

    // layer attributes
    layerattr.forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });

    // Draw outline
    let path = d3.geoPath(svg.projection);
    layer.append("path").attr("d", path({ type: "Sphere" }));
    // Output
    if (newcontainer) {
      return render(svg);
    } else {
      return `#${opts.id}`;
    }
  }
}
