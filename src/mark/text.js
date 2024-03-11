import { geoPath, geoIdentity, geoCentroid } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoIdentity, geoCentroid });
import { create } from "../container/create";
import { render } from "../container/render";
import { centroid } from "../tool/centroid";

import {
  camelcasetodash,
  unique,
  implantation,
  propertiesentries,
  detectinput,
  getsize,
  check,
  order,
} from "../helpers/utils";

/**
 * @description The `text` function allows to add a text on the map. It allow also to create a layer with labels from a geoJSON
 * @see {@link https://observablehq.com/@neocartocnrs/text-mark}
 *
 * @param {SVGSVGElement} arg1 - SVG container (optional)
 * @param {object} arg2 - options and parameters
 * @param {object} arg2.data - GeoJSON FeatureCollection
 * @param {string} arg2.id - id of the layer
 * @param {string|function} arg2.text - text to be displayed
 * @param {string|function} arg2.textAnchor - text anchor ("start", "middle", "end")
 * @param {string|function} arg2.dominantBaseline - dominant-baseline ("auto", "middle", "central", "hanging")
 * @param {string} arg2.fontFamily - font-family (default: font defined in the svg container)
 * @param {number} arg2.fontSize - font-size (default: 12)
 * @param {number} arg2.lineSpacing - line spacinf (default: 0)
 * @param {number[]} arg2.pos - position to display a single text element (default [0,0])
 * @param {number} arg2.dx - shift in x (default 0)
 * @param {number} arg2.dy - shift in y (default: 0)
 * @param {string|function} arg2.sort - the field to sort labels or a sort function
 * @param {boolean} arg2.descending - text sorting order
 * @param {string} arg2.coords - use "svg" if the coordinates are already in the plan of the svg document (default: "geo")
 * @param {string|function} arg2.fill - fill color
 * @param {string|function} arg2.stroke - stroke color
 * @param {number} arg2.strokeWidth - stroke width (default: 1)
 * @param {string|function} arg2.strokeLinejoin - stroke-linejoin (default: "round")
 * @param {boolean|function} arg2.tip - a function to display the tip. Use true tu display all fields
 * @param {object} arg2.tipstyle - tooltip style
 * @param {*} arg2.foo - *other SVG attributes that can be applied (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * geoviz.text(svg, { pos: [10,20], text: "Hello World" }) // a single text
 * geoviz.text(svg, { data: cities, text: "name" }) // labels where svg is the container
 * svg.text({ data: cities, text: "name" }) // labels where svg is the container
 * geoviz.text({ data: cities, text: "name" }) // labels with no container
 *
 * @returns {SVGSVGElement|string} - the function adds a layer with texts to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 */

export function text(arg1, arg2) {
  // Test if new container
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer
    ? create({
        zoomable: true,
        control: false,
        domain: arg1.data || arg1.datum,
        projection: "none",
      })
    : arg1;

  // Arguments
  const options = {
    mark: "text",
    id: unique(),
    strokeWidth: 1,
    text: "text",
    sort: undefined,
    descending: true,
    paintOrder: "stroke",
    strokeLinejoin: "round",
    fontSize: 12,
    lineSpacing: 0,
    fontFamily: svg.fontFamily,
    dx: 0,
    dy: 0,
    pos: [0, 0],
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  if (!opts.data) {
    opts.coords = opts.coords !== undefined ? opts.coords : "svg";
    if (opts.coords !== "svg") {
      opts.dominantBaseline = opts.dominantBaseline
        ? opts.dominantBaseline
        : "middle";
      opts.textAnchor = opts.textAnchor ? opts.textAnchor : "middle";
    } else {
      opts.dominantBaseline = opts.dominantBaseline
        ? opts.dominantBaseline
        : "hanging";
      opts.textAnchor = opts.textAnchor ? opts.textAnchor : "start";
    }
  }

  if (opts.data) {
    svg.data = true;
    opts.coords = opts.coords !== undefined ? opts.coords : "geo";
    opts.textAnchor = opts.textAnchor ? opts.textAnchor : "middle";
    opts.dominantBaseline = opts.dominantBaseline
      ? opts.dominantBaseline
      : "middle";
    opts.data =
      implantation(opts.data) == 3
        ? centroid(opts.data, {
            latlong:
              svg.initproj == "none" || opts.coords == "svg" ? false : true,
          })
        : opts.data;
  }

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

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
      !["mark", "id", "datum", "data", "coords", "sort", "descending"].includes(
        d
      )
  );

  // Simple text
  if (!opts.data) {
    let projection = opts.coords == "svg" ? d3.geoIdentity() : svg.projection;
    let path = d3.geoPath(projection);

    notspecificattr.forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });

    let pos = path.centroid({ type: "Point", coordinates: opts.pos });
    pos[0] = pos[0] + opts.dx;
    pos[1] = pos[1] + opts.dy;

    if (opts.text.split("\n").length == 1) {
      layer
        .append("text")
        .attr("x", pos[0])
        .attr("y", pos[1])
        .text(opts.text)
        .attr("visibility", isNaN(pos[0]) ? "hidden" : "visible");
    } else {
      let delta = 0;
      switch (opts.dominantBaseline) {
        case "hanging":
          delta = 0;
          break;
        case "middle":
        case "central":
          delta = (opts.text.split("\n").length - 1) * opts.fontSize;
          delta = delta / 2;
          break;
        case "auto":
        case "text-top":
          delta = (opts.text.split("\n").length - 1) * opts.fontSize;
          break;
        default:
          delta = 0;
      }

      layer
        .selectAll("text")
        .data(opts.text.split("\n"))
        .join("text")
        .attr("x", pos[0])
        .attr(
          "y",
          (d, i) => pos[1] + i * (opts.fontSize + opts.lineSpacing) - delta
        )
        .text((d) => d)
        .attr("visibility", isNaN(pos[0]) ? "hidden" : "visible");
    }
  }

  // Labels
  if (opts.data) {
    let projection =
      opts.coords == "svg"
        ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
        : svg.projection;
    let path = d3.geoPath(projection);

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

    // Sort and filter
    let data = opts.data.features
      .filter((d) => d.geometry)
      .filter((d) => d.geometry.coordinates != undefined);

    data = order(data, opts.sort, {
      fields,
      descending: opts.descending,
    });

    // Drawing

    layer
      .selectAll("text")
      .data(data)
      .join((d) => {
        let n = d
          .append("text")
          .attr("x", (d) => path.centroid(d.geometry)[0])
          .attr("y", (d) => path.centroid(d.geometry)[1])
          .text(opts.text)
          .attr("visibility", (d) =>
            isNaN(path.centroid(d.geometry)[0]) ? "hidden" : "visible"
          );

        eltattr.forEach((e) => {
          n.attr(camelcasetodash(e), opts[e]);
        });
        return n;
      });
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
