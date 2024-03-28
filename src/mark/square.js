import { scaleSqrt } from "d3-scale";
import { arc } from "d3-shape";
import { radius as computeradius } from "../tool/radius";
import { max, descending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { scaleSqrt, max, descending, geoPath, geoIdentity, arc }
);
import { create } from "../container/create";
import { render } from "../container/render";
import { random } from "../tool/random";
import { centroid } from "../tool/centroid";
import { tooltip } from "../helpers/tooltip";
import { viewof } from "../helpers/viewof";
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
 * @function square
 * @description The `square` function allows to create a layer with rotable squares from a geoJSON. The function adds a layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/square-mark}
 *
 * @property {object} data - GeoJSON FeatureCollection
 * @property {string} [id] - id of the layer
 * @property {number[]} [pos = [0,0]] - position of the square to display a single square
 * @property {number} [dx = 0] - shift in x
 * @property {number} [dy = 0] - shift in y
 * @property {number} [angle = 0] - angle of the square
 * @property {number|string} [side = 20] - a number or the name of a property containing numerical values
 * @property {number} [k = 100] - size of the largest square(or corresponding to the value defined by `fixmax`)
 * @property {number} [fixmax] - value matching the square with size `k`. Setting this value is useful for making maps comparable with each other
 * @property {string|function} [sort] - the field to sort squares or a sort function
 * @property {boolean} [descending] - sorting order
 * @property {string} [coords = "geo"] - use "svg" if the coordinates are already in the plan of the svg document
 * @property {string|function} [fill] - fill color. To create choropleth maps or typologies, use the `tool.choro` and `tool.typo` functions
 * @property {string|function} [stroke] - stroke color. To create choropleth maps or typologies, use the `tool.choro` and `tool.typo` functions
 * @property {boolean|function} [tip = false] - a function to display the tip. Use true tu display all fields
 * @property {boolean} [view = false] - use true and viewof in Observable for this layer to act as Input
 * @property {object} [tipstyle] - tooltip style
 * @property {*} [*] - *other SVG attributes that can be applied (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @property {*} [svg_*]  - *parameters of the svg container created if the layer is not called inside a container (e.g svg_width)*
 * @example
 * // There are several ways to use this function
 * geoviz.square(svg, { pos: [10,20], side: 15 }) // a single square
 * geoviz.square(svg, { data: cities, side: "population" }) // where svg is the container
 * svg.square({ data: cities, side: "population" }) // where svg is the container
 * svg.plot({ type: "square", data: cities, side: "population" }) // where svg is the container
 * geoviz.square({ data: cities, side: "population" }) // no container
 */

export function square(arg1, arg2) {
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
    mark: "square",
    id: unique(),
    data: undefined,
    side: 20,
    k: 100,
    pos: [0, 0],
    dx: 0,
    dy: 0,
    angle: 0,
    sort: undefined,
    descending: true,
    fixmax: null,
    fill: random(),
    stroke: "white",
    tip: undefined,
    tipstyle: undefined,
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // New container
  let svgopts = { domain: opts.data || opts.datum };
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(0, 4) == "svg_" ? d.slice(4) : d]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

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

  // zoomable layer
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

  // Specific attributes
  let entries = Object.entries(opts).map((d) => d[0]);
  const notspecificattr = entries.filter(
    (d) =>
      ![
        "mark",
        "id",
        "coords",
        "data",
        "side",
        "k",
        "dx",
        "dy",
        "transform",
        "angle",
        "sort",
        "descending",
        "fixmax",
        "tip",
        "tipstyle",
        "pos",
      ].includes(d)
  );

  // Simple square
  if (!opts.data) {
    let projection = opts.coords == "svg" ? d3.geoIdentity() : svg.projection;
    let path = d3.geoPath(projection);
    notspecificattr.forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });

    let pos = path.centroid({ type: "Point", coordinates: opts.pos });
    layer
      .append("rect")
      .attr(
        "transform",
        `rotate(${opts.angle} ${pos[0] + opts.dx} ${pos[1] + opts.dy})
          translate(${opts.dx} ${opts.dy})`
      )
      //.attr("transform", `translate(${opts.dx} ${opts.dy})`)
      .attr("x", pos[0] - opts.side / 2)
      .attr("y", pos[1] - opts.side / 2)
      .attr("width", opts.side)
      .attr("height", opts.side)
      .attr("visibility", isNaN(pos[0]) ? "hidden" : "visible");
  } else {
    let projection =
      opts.coords == "svg"
        ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
        : svg.projection;
    let path = d3.geoPath(projection);

    // Centroid
    opts.data =
      implantation(opts.data) == 3
        ? centroid(opts.data, {
            latlong:
              svg.initproj == "none" || opts.coords == "svg" ? false : true,
          })
        : opts.data;

    // layer attributes
    let fields = propertiesentries(opts.data);
    const layerattr = notspecificattr.filter(
      (d) => detectinput(opts[d], fields) == "value"
    );
    layerattr.forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });

    // features attributes (iterate on)
    const eltattr = notspecificattr.filter((d) => !layerattr.includes(d));
    eltattr.forEach((d) => {
      opts[d] = check(opts[d], fields);
    });

    // Projection
    opts.coords == "svg"
      ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
      : svg.projection;

    // Radius
    let data = opts.data;
    let columns = propertiesentries(data);
    let radius = attr2radius(opts.side, {
      columns,
      geojson: opts.data,
      fixmax: opts.fixmax,
      k: opts.k,
    });

    // Sort & filter
    data = data.features
      .filter((d) => d.geometry)
      .filter((d) => d.geometry.coordinates != undefined);
    if (detectinput(opts.side, columns) == "field") {
      data = data.filter((d) => d.properties[opts.side] != undefined);
    }
    data = order(data, opts.sort || opts.side, {
      fields: columns,
      descending: opts.descending,
    });

    // Drawing

    layer
      .selectAll("path")
      .data(data)
      .join((d) => {
        let n = d
          .append("rect")

          .attr(
            "transform",
            (d) =>
              `rotate(${opts.angle} ${path.centroid(d.geometry)[0] + opts.dx} ${
                path.centroid(d.geometry)[1] + opts.dy
              })
              translate(${opts.dx} ${opts.dy})`
          )
          .attr(
            "x",
            (d) => path.centroid(d.geometry)[0] + opts.dx - radius(d, opts.side)
          )
          .attr(
            "y",
            (d) => path.centroid(d.geometry)[1] + opts.dy - radius(d, opts.side)
          )
          .attr("width", (d) => radius(d, opts.side) * 2)
          .attr("height", (d) => radius(d, opts.side) * 2)
          .attr("visibility", (d) =>
            isNaN(path.centroid(d.geometry)[0]) ? "hidden" : "visible"
          );

        eltattr.forEach((e) => {
          n.attr(camelcasetodash(e), opts[e]);
        });
        return n;
      });

    // Tooltip & view
    if (opts.tip) {
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
    if (!opts.tip && opts.view) {
      viewof(layer, svg);
    }
  }

  // Output
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

// convert r attrubute to radius function

function attr2radius(attr, { columns, geojson, fixmax, k } = {}) {
  switch (detectinput(attr, columns)) {
    case "function":
      return attr;
    case "field":
      let radius = computeradius(
        geojson.features.map((d) => d.properties[attr]),
        {
          fixmax,
          k,
        }
      );
      return (d, rr) => radius.r(d.properties[rr]);
    case "value":
      return (d) => attr;
  }
}
