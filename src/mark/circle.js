import { scaleSqrt } from "d3-scale";
import { max, descending, ascending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
import { select, selectAll } from "d3-selection";
import { transition } from "d3-transition";

const d3 = Object.assign(
  {},
  {
    scaleSqrt,
    max,
    descending,
    ascending,
    geoPath,
    geoIdentity,
    select,
    selectAll,
    transition,
  }
);
import { create } from "../container/create";
import { render } from "../container/render";
import { random } from "../tool/random";
import { radius as computeradius } from "../tool/radius";
import { dodge } from "../tool/dodge";
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
  order,
} from "../helpers/utils";
/**
 * @function circle
 * @description The `circle` function allows to add circles on a map. The function adds a layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/circle-mark}
 *
 * @property {object} data - GeoJSON FeatureCollection
 * @property {string} [id] - id of the layer
 * @property {number[]} [pos = [0,0]] - position of the circle to display a single circle
 * @property {number|string} [r = 10] - a number or the name of a property containing numerical values
 * @property {number} [k = 50] - radius of the largest circle (or corresponding to the value defined by `fixmax`)
 * @property {number} [fixmax = null] - value matching the circle with radius `k`. Setting this value is useful for making maps comparable with each other
 * @property {boolean} [dodge = false] - to avoid circle overlap
 * @property {number} [iteration = 200] - number of iteration to dodge circles
 * @property {string|function} [sort] - the field to sort circles or a sort function
 * @property {boolean} [descending] - circle sorting order
 * @property {string} [coords = "geo"] - use "svg" if the coordinates are already in the plan of the svg document
 * @property {string|function} [fill] - fill color. To create choropleth maps or typologies, use the `tool.choro` and `tool.typo` functions
 * @property {string|function} [stroke = "white"] - stroke color. To create choropleth maps or typologies, use the `tool.choro` and `tool.typo` functions
 * @property {boolean|function} [tip = false] - a function to display the tip. Use true tu display all fields
 * @property {boolean} [view] - use true and viewof in Observable for this layer to act as Input
 * @property {object} [tipstyle] - tooltip style
 * @property {boolean} [transition] - to allow transiation effects on circle updates
 * @property {number} [duration = 500] - duration of the transition in milliseconds
 * @property {*} [*] - *other SVG attributes that can be applied (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @property {*} [svg_*]  - *parameters of the svg container created if the layer is not called inside a container (e.g svg_width)*
 * @example
 * // There are several ways to use this function
 * geoviz.circle(svg, { pos: [10,20], r: 15 }) // a single circle
 * geoviz.circle(svg, { data: cities, r: "population" }) // where svg is the container
 * svg.circle({ data: cities, r: "population" }) // where svg is the container
 * svg.plot({ type: "circle", data: cities, r: "population" }) // where svg is the container
 * geoviz.circle({ data: cities, r: "population" }) // no container
 * geoviz.plot({ type = "circle", data: cities, r: "population" }) // no container
 */

export function circle(arg1, arg2) {
  // Determine if creating a new container
  const newContainer = !arg2 && !arg1?._groups ? true : false;
  arg1 = newContainer && !arg1 ? {} : arg1;
  arg2 = arg2 || {};

  // Default options
  const options = {
    mark: "circle",
    id: unique(),
    data: undefined,
    r: 10,
    k: 50,
    pos: [0, 0],
    sort: undefined,
    dodge: false,
    dodgegap: 0,
    iteration: 200,
    descending: true,
    fixmax: null,
    fill: random(),
    stroke: "white",
    tip: undefined,
    tipstyle: undefined,
    before: null,
    after: null,
    transition: false,
    duration: 500,
  };
  const opts = { ...options, ...(newContainer ? arg1 : arg2) };

  // Extract svg_* options
  const svgOpts = { domain: opts.data || opts.datum };
  Object.keys(opts)
    .filter((key) => key.startsWith("svg_"))
    .forEach((key) => {
      svgOpts[key.slice(4)] = opts[key];
      delete opts[key];
    });

  // Create or reference SVG container
  const svg = newContainer ? create(svgOpts) : arg1;
  console.log(arg1);

  // Initialize layer
  let layer = svg.select(`#${opts.id}`);
  if (layer.empty()) {
    layer = svg.append("g").attr("id", opts.id).attr("data-layer", "circle");
  }

  // Clear previous content if no transition
  if (!opts.transition) layer.selectAll("*").remove();

  // Determine coordinate type
  opts.coords = opts.data ? opts.coords || "geo" : opts.coords || "svg";

  // Compute centroids once if needed
  if (opts.data && implantation(opts.data) === 3) {
    opts.data = centroid(opts.data, {
      latlong: svg.initproj !== "none" && opts.coords !== "svg",
    });
  }

  // Zoomable layer handling
  if (svg.zoomable && !svg.parent) {
    const existingIndex = svg.zoomablelayers.findIndex((d) => d.id === opts.id);
    if (existingIndex < 0) {
      svg.zoomablelayers.push(opts);
    } else {
      svg.zoomablelayers[existingIndex] = opts;
    }
  }

  // Determine attributes that are not specific to circle drawing
  const entries = Object.keys(opts);
  const notSpecificAttr = entries.filter(
    (key) =>
      ![
        "mark",
        "id",
        "coords",
        "data",
        "r",
        "k",
        "sort",
        "dodge",
        "dodgegap",
        "iteration",
        "descending",
        "fixmax",
        "tip",
        "tipstyle",
        "pos",
        "before",
        "after",
        "transition",
        "duration",
      ].includes(key)
  );

  // Choose projection
  let projection = opts.coords === "svg" ? d3.geoIdentity() : svg.projection;
  let path = d3.geoPath(projection);

  // --- Simple single circle ---
  if (!opts.data) {
    notSpecificAttr.forEach((key) =>
      layer.attr(camelcasetodash(key), opts[key])
    );
    const pos = path.centroid({ type: "Point", coordinates: opts.pos });
    layer
      .append("circle")
      .attr("cx", pos[0])
      .attr("cy", pos[1])
      .attr("r", opts.r)
      .attr("visibility", isNaN(pos[0]) ? "hidden" : "visible");
  } else {
    // Prepare fields
    const fields = propertiesentries(opts.data);
    const layerAttr = notSpecificAttr.filter(
      (key) => detectinput(opts[key], fields) === "value"
    );
    layerAttr.forEach((key) => layer.attr(camelcasetodash(key), opts[key]));
    const eltAttr = notSpecificAttr.filter((key) => !layerAttr.includes(key));
    eltAttr.forEach((key) => (opts[key] = check(opts[key], fields)));

    // Use svg zoom if coordinates are SVG
    projection =
      opts.coords === "svg"
        ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
        : svg.projection;
    path = d3.geoPath(projection);

    // Handle dodge
    let data;
    if (opts.dodge) {
      data = JSON.parse(JSON.stringify(opts.data));
      const filtered = {
        features: data.features.filter(
          (d) =>
            !isNaN(path.centroid(d.geometry)[0]) &&
            !isNaN(path.centroid(d.geometry)[1])
        ),
      };
      data = dodge(filtered, {
        projection,
        gap: opts.dodgegap,
        r: opts.r,
        k: opts.k,
        fixmax: opts.fixmax,
        iteration: opts.iteration,
      });
      projection = d3.geoIdentity(); // After dodge, coordinates are SVG
      path = d3.geoPath(projection);
    } else {
      data = opts.data;
    }

    // Compute radius function
    const columns = propertiesentries(opts.data);
    const radius = attr2radius(opts.r, {
      columns,
      geojson: opts.data,
      fixmax: opts.fixmax,
      k: opts.k,
    });

    // Filter & sort features
    data = data.features.filter(
      (d) => d.geometry && d.geometry.coordinates !== undefined
    );
    if (detectinput(opts.r, columns) === "field") {
      data = data.filter(
        (d) =>
          d.properties?.hasOwnProperty(opts.r) &&
          d.properties[opts.r] !== undefined
      );
    }
    data = order(data, opts.sort || opts.r, {
      fields: columns,
      descending: opts.descending,
    });

    // --- Draw circles ---
    if (opts.transition) {
      // Compute positions and IDs
      const points = data
        .map((d, i) => {
          const c = path.centroid(d.geometry);
          return {
            ...d,
            d,
            cx: Number.isFinite(c[0]) ? c[0] : null,
            cy: Number.isFinite(c[1]) ? c[1] : null,
            radius: radius(d, opts.r),
            id: d.id || d.properties?.id || i,
            __order__: i, // preserve sorted order
          };
        })
        .filter((d) => d.cx !== null && d.cy !== null);

      const keyFn = (d) => d.id;

      const circles = layer.selectAll("circle").data(points, keyFn);

      // EXIT
      circles
        .exit()
        .transition()
        .duration(opts.duration)
        .attr("r", 0)
        .attr("opacity", 0)
        .remove();

      // UPDATE
      circles
        .transition()
        .duration(opts.duration)
        .attr("cx", (d) => d.cx)
        .attr("cy", (d) => d.cy)
        .attr("r", (d) => d.radius)
        .attr("opacity", 1)
        .attr("visibility", "visible")
        .style("fill", (d) =>
          typeof opts.fill === "function" ? opts.fill(d.d) : opts.fill
        )
        .style("stroke", (d) =>
          typeof opts.stroke === "function" ? opts.stroke(d.d) : opts.stroke
        );

      // ENTER
      circles
        .enter()
        .append("circle")
        .attr("cx", (d) => d.cx)
        .attr("cy", (d) => d.cy)
        .attr("r", 0)
        .attr("opacity", 0)
        .attr("visibility", "visible")
        .style("fill", (d) =>
          typeof opts.fill === "function" ? opts.fill(d.d) : opts.fill
        )
        .style("stroke", (d) =>
          typeof opts.stroke === "function" ? opts.stroke(d.d) : opts.stroke
        )
        .transition()
        .duration(opts.duration)
        .attr("r", (d) => d.radius)
        .attr("opacity", 1);

      // Ensure proper DOM order
      layer
        .selectAll("circle")
        .sort((a, b) => d3.ascending(a.__order__, b.__order__));
    } else {
      // Non-transition path
      layer
        .selectAll("circle")
        .data(data)
        .join((d) => {
          const n = d
            .append("circle")
            .attr("cx", (d) => path.centroid(d.geometry)[0])
            .attr("cy", (d) => path.centroid(d.geometry)[1])
            .attr("r", (d) => radius(d, opts.r))
            .attr("visibility", (d) =>
              isNaN(path.centroid(d.geometry)[0]) ? "hidden" : "visible"
            );

          eltAttr.forEach((e) => n.attr(camelcasetodash(e), opts[e]));
          return n;
        });
    }

    // Tooltip & view handling
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

  // --- Output ---
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

// Convert r attribute to a radius function
function attr2radius(attr, { columns, geojson, fixmax, k } = {}) {
  switch (detectinput(attr, columns)) {
    case "function":
      return attr;
    case "field":
      const radius = computeradius(
        geojson.features.map((d) => d.properties?.[attr]),
        { fixmax, k }
      );
      return (d, rr) => radius.r(Math.abs(d.properties?.[rr]));
    case "value":
      return (d) => attr;
  }
}
