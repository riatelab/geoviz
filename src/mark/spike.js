import { scaleSqrt } from "d3-scale";
import { max, descending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { scaleSqrt, max, descending, geoPath, geoIdentity }
);
import { create } from "../container/create";
import { render } from "../container/render";
import { height as computeheight } from "../tool/height";
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
 * @description The `spike` function allows to create a layer with spikes from a geoJSON
 * @see {@link https://observablehq.com/@neocartocnrs/spike-mark}
 *
 * @param {SVGSVGElement} arg1 - SVG container (optional)
 * @param {object} arg2 - options and parameters
 * @param {object} arg2.data - GeoJSON FeatureCollection
 * @param {string} arg2.id - id of the layer
 * @param {number[]} arg2.pos - position of the sîkes to display a single spike (default [0,0])
 * @param {number|string} arg2.height - a number or the name of a property containing numerical values (default: 10)
 * @param {number} arg2.width - a number defining the width of the spikes (default: 30)
 * @param {number} arg2.straight - a number between 0 and 1 defining the curve of the spikes. 0 = curved ; 1 = straight (default: 0)
 * @param {number} arg2.k - height of the highest spike (or corresponding to the value defined by `fixmax`)  (default: 100)
 * @param {number} arg2.fixmax - value matching the spikes with height `k`. Setting this value is useful for making maps comparable with each other
 * @param {string|function} arg2.sort - the field to sort spikes or a sort function
 * @param {boolean} arg2.descending - spikes sorting order
 * @param {boolean} arg2.latlong - use false if the coordinates are already in the plan of the page (default: true)
 * @param {string|function} arg2.fill - fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} arg2.stroke - stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {boolean|function} arg2.tip - a function to display the tip. Use true tu display all fields
 * @param {object} arg2.tipstyle - tooltip style
 * @param {*} arg2.foo - *other SVG attributes that can be applied (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * geoviz.spike(svg, { pos: [10,20], height: 15 }) // a single circle
 * geoviz.spike(svg, { data: cities, height: "population" }) // where svg is the container
 * svg.spike({ data: cities, height: "population" }) // where svg is the container
 * geoviz.spike({ data: cities, height: "population" }) // no container
 *
 * @returns {SVGSVGElement|string} - the function adds a layer with spikes to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 */

export function spike(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create({ zoomable: true, domain: arg1.data }) : arg1;

  // Arguments
  const options = {
    mark: "spike",
    id: unique(),
    //latlong: true,
    data: undefined,
    pos: [0, 0],
    k: 50,
    width: 30,
    height: 100,
    pos: [0, 0],
    straight: 0,
    sort: undefined,
    descending: true,
    fixmax: null,
    fill: "#F13C47",
    stroke: "#F13C47",
    fillOpacity: 0.5,
    strokeWidth: 0.5,
    tip: undefined,
    tipstyle: undefined,
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  if (!opts.data) {
    opts.latlong = opts.latlong !== undefined ? opts.latlong : false;
  }

  if (opts.data) {
    opts.latlong = opts.latlong !== undefined ? opts.latlong : true;
    opts.data =
      implantation(opts.data) == 3
        ? centroid(opts.data, { latlong: opts.latlong })
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
        "latlong",
        "data",
        "height",
        "width",
        "k",
        "sort",
        "descending",
        "fixmax",
        "tip",
        "tipstyle",
        "pos",
      ].includes(d)
  );

  // Projection
  let projection = opts.latlong ? svg.projection : d3.geoIdentity();
  let path = d3.geoPath(projection);

  // Simple spike
  if (!opts.data) {
    notspecificattr.forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });
    let pos = path.centroid({ type: "Point", coordinates: opts.pos });
    layer
      .append("path")
      .attr(
        "d",
        `m ${pos[0] - opts.width / 2},${pos[1]} Q ${pos[0]},${
          pos[1] - opts.height * opts.straight
        },${pos[0]} ${pos[1] - opts.height}
     Q ${pos[0]}, ${pos[1] - opts.height * opts.straight} ${
          pos[0] + opts.width / 2
        },${pos[1]}`
      )
      .attr("visibility", isNaN(pos[0]) ? "hidden" : "visible");
  } else {
    // Centroid
    opts.data =
      implantation(opts.data) == 3
        ? centroid(opts.data, { latlong: opts.latlong })
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
    let projection =
      opts.latlong == false
        ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
        : svg.projection;

    // Height
    let data = opts.data;
    let columns = propertiesentries(data);

    const type = detectinput(opts.height, columns);
    let drawspike;
    switch (type) {
      case "value":
        drawspike = (d) =>
          `m ${path.centroid(d.geometry)[0] - opts.width / 2},${
            path.centroid(d.geometry)[1]
          } Q ${path.centroid(d.geometry)[0]},${
            path.centroid(d.geometry)[1] - opts.height * opts.straight
          },${path.centroid(d.geometry)[0]} ${
            path.centroid(d.geometry)[1] - opts.height
          }
         Q ${path.centroid(d.geometry)[0]}, ${
            path.centroid(d.geometry)[1] - opts.height * opts.straight
          } ${path.centroid(d.geometry)[0] + opts.width / 2},${
            path.centroid(d.geometry)[1]
          }`;
        break;
      case "field":
        const yscale = computeheight(
          data.features.map((d) => d.properties[opts.height]),
          {
            fixmax: opts.fixmax,
            k: opts.k,
          }
        ).h;

        drawspike = (d) =>
          `m ${path.centroid(d.geometry)[0] - opts.width / 2},${
            path.centroid(d.geometry)[1]
          } Q ${path.centroid(d.geometry)[0]},${
            path.centroid(d.geometry)[1] -
            yscale(d.properties[opts.height]) * opts.straight
          },${path.centroid(d.geometry)[0]} ${
            path.centroid(d.geometry)[1] - yscale(d.properties[opts.height])
          }
         Q ${path.centroid(d.geometry)[0]}, ${
            path.centroid(d.geometry)[1] -
            yscale(d.properties[opts.height]) * opts.straight
          } ${path.centroid(d.geometry)[0] + opts.width / 2},${
            path.centroid(d.geometry)[1]
          }`;

        break;
    }

    // Sort & filter
    data = data.features
      .filter((d) => d.geometry)
      .filter((d) => d.geometry.coordinates != undefined);
    if (detectinput(opts.height, columns) == "field") {
      data = data.filter((d) => d.properties[opts.height] != undefined);
    }
    data = order(data, opts.sort || opts.height, {
      fields: columns,
      descending: opts.descending,
    });

    // Drawing

    path = d3.geoPath(projection);

    layer
      .selectAll("path")
      .data(data)
      .join((d) => {
        let n = d
          .append("path")
          .attr("d", drawspike)
          .attr("visibility", (d) =>
            isNaN(path.centroid(d.geometry)[0]) ? "hidden" : "visible"
          );

        eltattr.forEach((e) => {
          n.attr(camelcasetodash(e), opts[e]);
        });
        return n;
      });

    // Tooltip
    if (opts.tip) {
      tooltip(layer, opts.data, svg, opts.tip, opts.tipstyle, fields);
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