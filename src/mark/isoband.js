import { scaleSqrt } from "d3-scale";
import { max, sum, extent } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
import { contourDensity } from "d3-contour";

const d3 = Object.assign(
  {},
  {
    scaleSqrt,
    max,
    geoPath,
    geoIdentity,
    contourDensity,
    sum,
    extent,
  },
);

import { create } from "../container/create";
import { render } from "../container/render";
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
  // ---------------------------
  // Container detection
  // ---------------------------

  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;

  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;

  // ---------------------------
  // Options
  // ---------------------------

  const options = {
    mark: "smooth",
    id: unique(),
    data: undefined,
    field: undefined,
    nb: 100000,
    bandwidth: undefined,
    thresholds: undefined,
    cellSize: undefined,
    fill: random(),
    stroke: "none",
    tip: undefined,
    tipstyle: undefined,
  };

  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // ---------------------------
  // Create container if needed
  // ---------------------------

  let svgopts = { domain: opts.data || opts.datum };

  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, { [d.slice(4)]: opts[d] });
      delete opts[d];
    });

  let svg = newcontainer ? create(svgopts) : arg1;

  // ---------------------------
  // Init layer
  // ---------------------------

  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id).attr("data-layer", "isoband")
    : svg.select(`#${opts.id}`);

  layer.selectAll("*").remove();

  // ---------------------------
  // Coordinates mode
  // ---------------------------

  if (!opts.data) {
    opts.coords = opts.coords !== undefined ? opts.coords : "svg";
  }

  if (opts.data) {
    opts.coords = opts.coords !== undefined ? opts.coords : "geo";

    opts.data =
      implantation(opts.data) == 3
        ? centroid(opts.data, {
            latlong:
              svg.initproj == "none" || opts.coords == "svg" ? false : true,
          })
        : opts.data;
  }

  // ---------------------------
  // Zoomable layer
  // ---------------------------

  if (svg.zoomable && !svg.parent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      svg.zoomablelayers.push(opts);
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id),
      );
      svg.zoomablelayers[i] = opts;
    }
  }

  // ---------------------------
  // Attributes separation
  // ---------------------------

  let entries = Object.entries(opts).map((d) => d[0]);

  const notspecificattr = entries.filter(
    (d) =>
      ![
        "mark",
        "id",
        "coords",
        "data",
        "bandwidth",
        "thresholds",
        "cellSize",
        "tip",
        "tipstyle",
        "pos",
        "field",
        "nb",
      ].includes(d),
  );

  // ---------------------------
  // No data case
  // ---------------------------

  if (!opts.data) return;

  // ---------------------------
  // Projection
  // ---------------------------

  let projection =
    opts.coords == "svg"
      ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
      : svg.projection;

  let path = d3.geoPath(d3.geoIdentity());

  // ---------------------------
  // Centroid safety
  // ---------------------------

  opts.data =
    implantation(opts.data) == 3
      ? centroid(opts.data, {
          latlong:
            svg.initproj == "none" || opts.coords == "svg" ? false : true,
        })
      : opts.data;

  // ---------------------------
  // Layer attributes
  // ---------------------------

  let fields = propertiesentries(opts.data);

  const layerattr = notspecificattr.filter(
    (d) => detectinput(opts[d], fields) == "value",
  );

  layerattr.forEach((d) => {
    layer.attr(camelcasetodash(d), opts[d]);
  });

  // ---------------------------
  // Element attributes
  // ---------------------------

  const eltattr = notspecificattr.filter((d) => !layerattr.includes(d));

  eltattr.forEach((d) => {
    opts[d] = check(opts[d], fields);
  });

  // ---------------------------
  // Build dots
  // ---------------------------

  let dots = decompose({
    data: opts.data,
    field: opts.field,
    nb: opts.nb,
    projection,
  });

  if (!dots.length) return;

  // ---------------------------
  // Density params
  // ---------------------------

  const n = dots.length;

  const bandwidth = opts.bandwidth ?? Math.min(svg.width, svg.height) / 100;

  const thresholds =
    opts.thresholds ?? Math.max(5, Math.min(20, Math.round(Math.sqrt(n) / 2)));

  const cellSize = opts.cellSize ?? Math.max(2, Math.round(bandwidth / 3));

  // ---------------------------
  // Density generator
  // ---------------------------

  let contour = d3
    .contourDensity()
    .x((d) => d[0])
    .y((d) => d[1])
    .size([svg.width, svg.height])
    .bandwidth(bandwidth)
    .thresholds(thresholds)
    .cellSize(cellSize);

  let bands = contour(dots);

  // ---------------------------
  // Opacity scale
  // ---------------------------

  const opacityScale = d3
    .scaleSqrt()
    .domain(d3.extent(bands, (d) => d.value))
    .range([0.1, 1]);

  // ---------------------------
  // Draw
  // ---------------------------

  layer
    .selectAll("path")
    .data(bands)
    .join("path")
    .attr("d", path)
    .attr("fill", opts.fill)
    .attr("stroke", opts.stroke)
    .attr("opacity", (d) => opacityScale(d.value))
    .each(function (d) {
      eltattr.forEach((e) => {
        d3.select(this).attr(camelcasetodash(e), opts[e](d));
      });
    });

  // ---------------------------
  // Tooltip
  // ---------------------------

  if (opts.tip || opts.tipstyle || opts.view) {
    tooltip(layer, bands, svg, opts.tip, opts.tipstyle, ["value"], opts.view);
  }

  // ---------------------------
  // Output
  // ---------------------------

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

// ----------------------------------------------------
// Helpers
// ----------------------------------------------------

function decompose({ data, field, nb = 100000, projection } = {}) {
  let dots;

  if (field == undefined) {
    dots = data.features
      .map((d) => [...projection(d.geometry.coordinates), 1])
      .filter((row) => row.every((val) => Boolean(val)));
  } else {
    dots = data.features
      .map((d) => [
        ...projection(d.geometry.coordinates),
        Number(d.properties[field]),
      ])
      .filter((row) => row.every((val) => Boolean(val)));

    const sum = d3.sum(dots.map((d) => d[2]));

    let nb_target = nb == null ? sum : nb < sum ? nb : sum;
    let pct = nb_target / sum;

    dots = dots.map((d) => [d[0], d[1], Math.round(d[2] * pct)]);
    dots = dots.flatMap(([x, y, n]) => Array.from({ length: n }, () => [x, y]));
  }

  return dots;
}
