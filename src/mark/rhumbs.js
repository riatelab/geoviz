import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash, unique } from "../helpers/utils";

/**
 * @function rhumbs
 * @description The `rhumbs` function allows to display "rhumb lines" like on old portolan charts
 * @see {@link https://observablehq.com/@neocartocnrs/layout-marks}
 *
 * @property {string} [id] - id of the layer
 * @property {number} [nb = 16] - number of lines
 * @property {array} [pos = [10,10]] - position of the lines. If coords = "svg", pos values are in the svg document. If coords = "geo", pos values ar in latitude and longitude.
 * @property {string} [coords = "svg"] - See pos. If coords == "geo" and zoomable == true, then lines move with the zoom.
 * @property {string} [stroke = "#394a70"] - stroke color.
 * @property {number} [strokeWidth = 1] - stroke-width.
 * @property {number} [strokeOpacity = 0.3] - stroke-opacity.
 * @property {array|number} [strokeDasharray = [3,2]] - stroke-dasharray
 * @property {*} [*] - *other SVG attributes that can be applied (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @property {*} [svg_*]  - *parameters of the svg container created if the layer is not called inside a container (e.g svg_width)*
 * @example
 * // There are several ways to use this function
 * geoviz.rhumbs(svg, { nb: 36 }) // where svg is the container
 * svg.rhumbs({ nb: 36 }) // where svg is the container
 * svg.plot({ type: "rhumbs", nb: 36 }) // where svg is the container
 * geoviz.rhumbs({ step: 36 }) // no container
 */

export function rhumbs(arg1, arg2) {
  // Test if new container
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;

  // Arguments by default
  const options = {
    mark: "rhumbs",
    id: unique(),
    nb: 16,
    pos: [10, 10],
    coords: "svg",
    stroke: "#394a70",
    strokeWidth: 1,
    strokeOpacity: 0.3,
    strokeDasharray: [3, 2],
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // The container
  let svgopts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(0, 4) == "svg_" ? d.slice(4) : d]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

  // init a layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Some values
  const angles = getangle(opts.nb);
  const size = Math.max(svg.width, svg.height);
  const pos = opts.coords == "svg" ? opts.pos : svg.projection(opts.pos);

  // Draw
  const rhumbs = layer
    .selectAll("polyline")
    .data(angles)
    .join("polyline")
    .attr("points", function (d, i) {
      let x2 = pos[0] + Math.cos(d) * size;
      let y2 = pos[1] + Math.sin(d) * size;
      return pos[0] + "," + pos[1] + " " + x2 + "," + y2;
    });

  // Attributes
  let entries = Object.entries(opts).map((d) => d[0]);
  entries.forEach((d) => {
    rhumbs.attr(camelcasetodash(d), opts[d]);
  });

  // Zoom
  if (svg.zoomable && !svg.parent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      svg.zoomablelayers.push(opts);
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id)
      );
      svg.zoomablelayers[i] = opts;
    }
  }

  // Render
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}

// An helper
function getangle(nb) {
  let angles = [];
  for (let i = 0; i < nb; i++) {
    angles[i] = (360 / nb) * i * (Math.PI / 180);
  }
  return angles;
}
