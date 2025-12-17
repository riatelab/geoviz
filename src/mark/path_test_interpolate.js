import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoIdentity });
import { create } from "../container/create";
import { render } from "../container/render";
import { tooltip } from "../helpers/tooltip";
import { random } from "../tool/random";
import { interpolate } from "flubber"; // 🛠 Flubber

import {
  camelcasetodash,
  unique,
  implantation,
  propertiesentries,
  detectinput,
  check,
  getsize,
} from "../helpers/utils";

/**
 * @function path
 * @description Generates SVG paths from a GeoJSON. Supports transitions like circle mark. Adds a layer to SVG and returns its id or rendered SVG if new container.
 * @see {@link https://observablehq.com/@neocartocnrs/path-mark}
 *
 * @property {object} data - GeoJSON FeatureCollection for iteration
 * @property {object} datum - GeoJSON FeatureCollection for a single datum
 * @property {string} [id] - layer id
 * @property {string} [coords="geo"] - "svg" if coordinates are already in SVG plane
 * @property {boolean} [clip=true] - clip paths with outline
 * @property {string|function} [fill] - fill color
 * @property {string|function} [stroke] - stroke color
 * @property {number} [strokeWidth=1] - stroke width
 * @property {boolean|function} [tip=false] - tooltip function
 * @property {boolean} [view=false] - viewof for Observable
 * @property {object} [tipstyle] - tooltip style
 * @property {boolean} [transition=false] - enable transition for updates
 * @property {number} [duration=500] - transition duration in ms
 * @property {*} [*] - other SVG attributes
 * @property {*} [svg_*] - SVG container options if new container
 */

export function path(arg1, arg2) {
  const newContainer = !arg2 && !arg1?._groups;
  arg1 = newContainer && !arg1 ? {} : arg1;
  arg2 = arg2 || {};

  const options = {
    mark: "path",
    id: unique(),
    coords: "geo",
    clip: true,
    strokeWidth: 1,
    clipPath: undefined,
    fill: undefined,
    stroke: undefined,
    tip: false,
    tipstyle: undefined,
    view: false,
    transition: false,
    duration: 500,
    before: null,
    after: null,
  };
  const opts = { ...options, ...(newContainer ? arg1 : arg2) };

  const svgOpts = { domain: opts.data || opts.datum };
  Object.keys(opts)
    .filter((k) => k.startsWith("svg_"))
    .forEach((k) => {
      svgOpts[k.slice(4)] = opts[k];
      delete opts[k];
    });

  const svg = newContainer ? create(svgOpts) : arg1;
  if (opts.data || opts.datum) svg.data = true;

  const randomCol = random();
  if (opts.data) {
    if (implantation(opts.data) === 2) {
      opts.fill ??= "none";
      opts.stroke ??= randomCol;
    } else {
      opts.fill ??= randomCol;
      opts.stroke ??= "white";
    }
  }
  if (opts.datum) {
    if (implantation(opts.datum) === 2) {
      opts.fill ??= "none";
      opts.stroke ??= randomCol;
    } else {
      opts.fill ??= randomCol;
      opts.stroke ??= "none";
    }
  }

  let layer = svg.select(`#${opts.id}`);
  if (layer.empty()) {
    const before = opts.before
      ? opts.before.startsWith("#")
        ? opts.before
        : `#${opts.before}`
      : null;
    const after = opts.after
      ? opts.after.startsWith("#")
        ? opts.after
        : `#${opts.after}`
      : null;

    if (before && svg.select(before).node()) {
      layer = svg
        .insert("g", before)
        .attr("id", opts.id)
        .attr("data-layer", "path");
    } else if (after && svg.select(after).node()) {
      const ref = svg.select(after).node();
      layer = svg.append("g").attr("id", opts.id).attr("data-layer", "path");
      ref.after(layer.node());
    } else {
      layer = svg.append("g").attr("id", opts.id).attr("data-layer", "path");
    }
  }

  if (!opts.transition) layer.selectAll("*").remove();

  if (svg.zoomable && !svg.parent) {
    const existingIndex = svg.zoomablelayers.findIndex((d) => d.id === opts.id);
    if (existingIndex < 0) {
      svg.zoomablelayers.push({
        mark: opts.mark,
        id: opts.id,
        coords: opts.coords,
      });
    } else {
      svg.zoomablelayers[existingIndex] = {
        mark: opts.mark,
        id: opts.id,
        coords: opts.coords,
      };
    }
  }

  const projection =
    opts.coords === "svg"
      ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
      : svg.projection;
  const pathGen = d3.geoPath(projection);

  if (opts.clipPath) {
    layer.attr("clip-path", opts.clipPath);
    opts.clip = false;
  } else if (opts.clip && opts.coords !== "svg" && svg.initproj !== "none") {
    const clipid = unique();
    svg
      .append("clipPath")
      .attr("id", clipid)
      .append("path")
      .attr("d", pathGen({ type: "Sphere" }));
    layer.attr("clip-path", `url(#${clipid})`);
  }

  const entries = Object.keys(opts);
  const notSpecificAttr = entries.filter(
    (key) =>
      ![
        "mark",
        "id",
        "datum",
        "data",
        "coords",
        "tip",
        "tipstyle",
        "clipPath",
      ].includes(key)
  );

  const fields = propertiesentries(opts.data || opts.datum);
  const layerAttr = notSpecificAttr.filter(
    (key) => detectinput(opts[key], fields) === "value"
  );
  layerAttr.forEach((key) => layer.attr(camelcasetodash(key), opts[key]));
  const eltAttr = notSpecificAttr.filter((key) => !layerAttr.includes(key));
  eltAttr.forEach((key) => (opts[key] = check(opts[key], fields)));

  // --- DATUM HANDLING ---
  if (opts.datum) {
    const datumFields = propertiesentries([opts.datum]);
    let datumPath = layer.selectAll("path").data([opts.datum]);

    datumPath.join(
      (enter) =>
        enter
          .append("path")
          .attr("d", pathGen)
          .style(
            "fill",
            typeof opts.fill === "function" ? opts.fill(opts.datum) : opts.fill
          )
          .style(
            "stroke",
            typeof opts.stroke === "function"
              ? opts.stroke(opts.datum)
              : opts.stroke
          )
          .style("opacity", opts.transition ? 0 : 1)
          .call(
            (enter) =>
              opts.transition &&
              enter.transition().duration(opts.duration).style("opacity", 1)
          ),
      (update) =>
        update.call((update) =>
          opts.transition
            ? update
                .transition()
                .duration(opts.duration)
                .attrTween("d", function (d) {
                  const from = this.getAttribute("d") || pathGen(d);
                  const to = pathGen(d);
                  return interpolate(from, to);
                })
                .style(
                  "fill",
                  typeof opts.fill === "function"
                    ? opts.fill(opts.datum)
                    : opts.fill
                )
                .style(
                  "stroke",
                  typeof opts.stroke === "function"
                    ? opts.stroke(opts.datum)
                    : opts.stroke
                )
            : update
                .attr("d", pathGen)
                .style(
                  "fill",
                  typeof opts.fill === "function"
                    ? opts.fill(opts.datum)
                    : opts.fill
                )
                .style(
                  "stroke",
                  typeof opts.stroke === "function"
                    ? opts.stroke(opts.datum)
                    : opts.stroke
                )
        ),
      (exit) => exit.remove()
    );

    // Tooltip attaché au body pour être au-dessus
    if (opts.tip || opts.tipstyle || opts.view) {
      tooltip(
        null,
        [opts.datum],
        svg,
        opts.tip,
        opts.tipstyle,
        datumFields,
        opts.view
      );
    }
  }

  // --- DATA HANDLING ---
  if (opts.data) {
    const features = opts.data.features.filter((d) => d.geometry !== null);

    const paths = layer
      .selectAll("path")
      .data(features, (d, i) => d.id || d.properties?.id || i);

    paths
      .exit()
      .transition()
      .duration(opts.duration)
      .style("opacity", 0)
      .remove();

    if (opts.transition) {
      paths
        .transition()
        .duration(opts.duration)
        .attrTween("d", function (d) {
          const from = this.getAttribute("d") || pathGen(d);
          const to = pathGen(d);
          const interpolator = interpolate(from, to);
          return (t) => interpolator(t);
        })
        .style("fill", (d) =>
          typeof opts.fill === "function" ? opts.fill(d) : opts.fill
        )
        .style("stroke", (d) =>
          typeof opts.stroke === "function" ? opts.stroke(d) : opts.stroke
        );
    } else {
      paths
        .attr("d", pathGen)
        .style("fill", (d) =>
          typeof opts.fill === "function" ? opts.fill(d) : opts.fill
        )
        .style("stroke", (d) =>
          typeof opts.stroke === "function" ? opts.stroke(d) : opts.stroke
        );
    }

    paths
      .enter()
      .append("path")
      .attr("d", pathGen)
      .style("opacity", opts.transition ? 0 : 1)
      .style("fill", (d) =>
        typeof opts.fill === "function" ? opts.fill(d) : opts.fill
      )
      .style("stroke", (d) =>
        typeof opts.stroke === "function" ? opts.stroke(d) : opts.stroke
      )
      .transition()
      .duration(opts.duration)
      .style("opacity", 1);

    if (opts.tip || opts.tipstyle || opts.view) {
      tooltip(
        layer,
        opts.data,
        svg,
        opts.tip,
        opts.tipstyle,
        fields,
        opts.view
      );
    }
  }

  Object.assign(svg, { viewbox: getsize(layer) });

  if (newContainer) {
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
