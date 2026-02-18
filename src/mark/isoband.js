import { scaleSqrt, scaleSequential, scaleLinear } from "d3-scale";
import { max, sum, extent } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
import { contourDensity } from "d3-contour";
import {
  interpolateInferno,
  interpolateViridis,
  interpolateWarm,
  interpolateCool,
} from "d3-scale-chromatic";

const d3 = Object.assign(
  {},
  {
    scaleSqrt,
    scaleSequential,
    scaleLinear,
    max,
    geoPath,
    geoIdentity,
    contourDensity,
    sum,
    extent,
  },
);

import { create } from "../container/create";
import { shadow } from "../effect/shadow";
import { render } from "../container/render";
import { flattendots } from "../tool/flattendots.js";
import { random } from "../tool/random";
import { centroid } from "../tool/centroid";
import { tooltip } from "../helpers/tooltip";

import {
  camelcasetodash,
  unique,
  getsize,
  check,
  implantation,
  propertiesentries,
  detectinput,
} from "../helpers/utils";

export function isoband(arg1, arg2) {
  const newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups;

  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;

  const options = {
    mark: "isoband",
    id: unique(),
    data: undefined,
    var: undefined,
    nb: 100000,
    bandwidth: undefined,
    fixbandwidth: false,
    thresholds: undefined,
    cellSize: undefined,
    stroke: "white",
    strokeWidth: 0.7,
    shadow: true,
    tip: undefined,
    tipstyle: undefined,
    fill: random(),
    colors: undefined,
    opacity: undefined,
    fillOpacity: 0.5,
  };

  const opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  let svgopts = { domain: opts.data || opts.datum };

  Object.keys(opts)
    .filter((str) => str.slice(0, 4) === "svg_")
    .forEach((d) => {
      Object.assign(svgopts, { [d.slice(4)]: opts[d] });
      delete opts[d];
    });

  const svg = newcontainer ? create(svgopts) : arg1;

  const layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id).attr("data-layer", "isoband")
    : svg.select(`#${opts.id}`);

  layer.selectAll("*").remove();

  if (!opts.data) opts.coords = opts.coords ?? "svg";

  if (opts.data) {
    opts.coords = opts.coords ?? "geo";
    opts.data =
      implantation(opts.data) === 3
        ? centroid(opts.data, {
            latlong:
              svg.initproj === "none" || opts.coords === "svg" ? false : true,
          })
        : opts.data;
  }

  if (svg.zoomable && !svg.parent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      svg.zoomablelayers.push(opts);
    } else {
      const i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id === opts.id),
      );
      svg.zoomablelayers[i] = opts;
    }
  }

  const entries = Object.entries(opts).map((d) => d[0]);
  const notspecificattr = entries.filter(
    (d) =>
      ![
        "mark",
        "id",
        "coords",
        "data",
        "bandwidth",
        "fixbandwidth",
        "thresholds",
        "cellSize",
        "tip",
        "tipstyle",
        "pos",
        "var",
        "nb",
        "fill",
        "colors",
        "opacity",
        "fillOpacity",
      ].includes(d),
  );

  if (!opts.data) return;

  const projection =
    opts.coords === "svg"
      ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
      : svg.projection;

  const path = d3.geoPath(d3.geoIdentity());

  opts.data =
    implantation(opts.data) === 3
      ? centroid(opts.data, {
          latlong:
            svg.initproj === "none" || opts.coords === "svg" ? false : true,
        })
      : opts.data;

  const fields = propertiesentries(opts.data);

  const layerattr = notspecificattr.filter(
    (d) => detectinput(opts[d], fields) === "value",
  );
  layerattr.forEach((d) => {
    layer.attr(camelcasetodash(d), opts[d]);
  });

  const eltattr = notspecificattr.filter((d) => !layerattr.includes(d));
  eltattr.forEach((d) => {
    opts[d] = check(opts[d], fields);
  });

  let dots = flattendots({
    data: opts.data,
    var: opts.var,
    nb: opts.nb,
    projection,
  });
  if (!dots.length) return;

  const n = dots.length;
  const bandwidth = !opts.fixbandwidth
    ? (opts.bandwidth ?? Math.min(svg.width, svg.height) / 100)
    : (opts.bandwidth ?? Math.min(svg.width, svg.height) / 100) *
      (svg.zoom.k ?? 1);

  const thresholds =
    opts.thresholds ?? Math.max(5, Math.min(20, Math.round(Math.sqrt(n) / 2)));
  const cellSize = opts.cellSize ?? Math.max(2, Math.round(bandwidth / 3));

  const contour = d3
    .contourDensity()
    .x((d) => d[0])
    .y((d) => d[1])
    .size([svg.width, svg.height])
    .bandwidth(bandwidth)
    .thresholds(thresholds)
    .cellSize(cellSize);

  const bands = contour(dots);

  // ---------------------------
  // Colors and opacity
  // ---------------------------
  let colorScale;
  if (opts.fill != null) {
    colorScale = () => opts.fill;
  } else if (typeof opts.colors === "string" && opts.colors.startsWith("#")) {
    colorScale = () => opts.colors;
  } else {
    let interpolator;
    switch ((opts.colors || "inferno").toLowerCase()) {
      case "viridis":
        interpolator = interpolateViridis;
        break;
      case "warm":
        interpolator = interpolateWarm;
        break;
      case "cool":
        interpolator = interpolateCool;
        break;
      case "inferno":
      default:
        interpolator = interpolateInferno;
    }
    const extentValues = d3.extent(bands, (d) => d.value);
    colorScale = d3.scaleSequential(interpolator).domain(extentValues);
  }

  const opacityFunc =
    opts.opacity != null
      ? () => opts.opacity
      : opts.fillOpacity != null
        ? () => opts.fillOpacity
        : () => 1;

  // ---------------------------
  // Draw
  // ---------------------------

  const shadowFilter = shadow(svg, {
    dx: 2,
    dy: 2,
    stdDeviation: 1.5,
    fill: "black",
    fillOpacity: 0.4,
  });

  layer
    .selectAll("path")
    .data(bands)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => colorScale(d.value))
    .attr("stroke", opts.stroke)
    .attr("opacity", (d) => opacityFunc(d))
    .attr("filter", opts.shadow ? shadowFilter : "none")
    .each(function (d) {
      eltattr.forEach((e) => {
        this.setAttribute(camelcasetodash(e), opts[e](d));
      });
    });

  if (opts.tip || opts.tipstyle || opts.view) {
    tooltip(layer, bands, svg, opts.tip, opts.tipstyle, ["value"], opts.view);
  }

  if (newcontainer) {
    const size = getsize(layer);
    svg
      .attr("width", size.width)
      .attr("height", size.height)
      .attr("viewBox", [size.x, size.y, size.width, size.height]);
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
