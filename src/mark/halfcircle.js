import { scaleSqrt } from "d3-scale";
import { arc } from "d3-shape";
import { max, descending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { scaleSqrt, max, descending, geoPath, geoIdentity, arc }
);
import { create } from "../container/create";
import { render } from "../container/render";
import { random } from "../tool/random";
import { radius as computeradius } from "../tool/radius";
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
 * @description The `halfcircle` function allows to create a layer with circles from a geoJSON
 * @see {@link https://observablehq.com/@neocartocnrs/circle-mark}
 *
 * @param {SVGSVGElement} arg1 - SVG container (optional)
 * @param {object} arg2 - options and parameters
 * @param {object} arg2.data - GeoJSON FeatureCollection
 * @param {string} arg2.id - id of the layer
 * @param {number[]} arg2.pos - position of the circle to display a single circle (default [0,0])
 * @param {number} arg2.dx - shift in x (delault: 0)
 * @param {number} arg2.dy - shift in y (delault: 0)
 * @param {number} arg2.angle - angle of the half circle (delault: 0)
 * @param {number|string} arg2.r - a number or the name of a property containing numerical values (default: 10)
 * @param {number|string} arg2.innerRadius - inner radius (default: 10)
 * @param {number} arg2.cornerRadius - corner radius (default: 2)
 * @param {number} arg2.k - radius of the largest circle (or corresponding to the value defined by `fixmax`)  (default: 50)
 * @param {number} arg2.fixmax - value matching the circle with radius `k`. Setting this value is useful for making maps comparable with each other
 * @param {string|function} arg2.sort - the field to sort circles or a sort function
 * @param {boolean} arg2.descending - circle sorting order
 * @param {boolean} arg2.latlong - use false if the coordinates are already in the plan of the page (default: true)
 * @param {string|function} arg2.fill - fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} arg2.stroke - stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {boolean|function} arg2.tip - a function to display the tip. Use true tu display all fields
 * @param {object} arg2.tipstyle - tooltip style
 * @param {*} arg2.foo - *other SVG attributes that can be applied (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * geoviz.circle(svg, { pos: [10,20], r: 15 }) // a single circle
 * geoviz.circle(svg, { data: cities, r: "population" }) // where svg is the container
 * svg.circle({ data: cities, r: "population" }) // where svg is the container
 * geoviz.circle({ data: cities, r: "population" }) // no container
 *
 * @returns {SVGSVGElement|string} - the function adds a layer with circles to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 */

export function halfcircle(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer
    ? create({ zoomable: true, domain: arg1.data, control: false })
    : arg1;

  // Arguments
  const options = {
    mark: "halfcircle",
    id: unique(),
    //latlong: true,
    data: undefined,
    r: 20,
    k: 50,
    pos: [0, 0],
    dx: 0,
    dy: 0,
    cornerRadius: 2,
    innerRadius: 0,
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
        "r",
        "k",
        "dx",
        "dy",
        "cornerRadius",
        "innerRadius",
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

  // Projection
  let projection = opts.latlong ? svg.projection : d3.geoIdentity();
  let path = d3.geoPath(projection);

  // Simple half circle
  if (!opts.data) {
    notspecificattr.forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });

    let pos = path.centroid({ type: "Point", coordinates: opts.pos });

    layer
      .append("path")
      .attr(
        "transform",
        `rotate(${opts.angle} ${pos[0] + opts.dx} ${
          pos[1] + opts.dy
        }) translate(${pos[0] + opts.dx} ${pos[1] + opts.dy})`
      )
      .attr(
        "d",
        d3
          .arc()
          .outerRadius(opts.r)
          .innerRadius(opts.innerRadius)
          .startAngle(-Math.PI / 2)
          .endAngle(Math.PI / 2)
          .cornerRadius(opts.cornerRadius)()
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

    // Radius
    let data = opts.data;
    let columns = propertiesentries(data);
    let radius = attr2radius(opts.r, {
      columns,
      geojson: opts.data,
      fixmax: opts.fixmax,
      k: opts.k,
    });

    // Sort & filter
    data = data.features
      .filter((d) => d.geometry)
      .filter((d) => d.geometry.coordinates != undefined);
    if (detectinput(opts.r, columns) == "field") {
      data = data.filter((d) => d.properties[opts.r] != undefined);
    }
    data = order(data, opts.sort || opts.r, {
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
          .attr(
            "transform",
            (d) =>
              `rotate(${opts.angle} ${path.centroid(d.geometry)[0] + opts.dx} ${
                path.centroid(d.geometry)[1] + opts.dy
              }) translate(${path.centroid(d.geometry)[0] + opts.dx} ${
                path.centroid(d.geometry)[1] + opts.dy
              })`
          )
          .attr("d", (d) =>
            d3
              .arc()
              .outerRadius(radius(d, opts.r))
              .innerRadius(radius(d, opts.innerRadius))
              .startAngle(-Math.PI / 2)
              .endAngle(Math.PI / 2)
              .cornerRadius(opts.cornerRadius)()
          )
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
