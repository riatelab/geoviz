import { scaleSqrt } from "d3-scale";
import { max, descending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { scaleSqrt, max, descending, geoPath, geoIdentity }
);
import { create } from "../container/create";
import { render } from "../container/render";
import { random } from "../tool/random";
import { radius as computeradius } from "../tool/radius";
import { dodge } from "../tool/dodge";
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
 * @property {string|function} [fill] - fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @property {string|function} [stroke = "white"] - stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @property {boolean|function} [tip = false] - a function to display the tip. Use true tu display all fields
 * @property {boolean} [view] - use true and viewof in Observable for this layer to act as Input
 * @property {object} [tipstyle] - tooltip style
 * @property {*} [*] - *other SVG attributes that can be applied (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
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
        domain: arg1.data,
        control: false,
        projection: "none",
      })
    : arg1;

  // Arguments
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
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  if (!opts.data) {
    opts.coords = opts.coords !== undefined ? opts.coords : "svg";
  }

  if (opts.data) {
    svg.data = true;
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
      ].includes(d)
  );

  // Projection
  let projection = opts.coords == "svg" ? d3.geoIdentity() : svg.projection;
  let path = d3.geoPath(projection);

  // Simple circle
  if (!opts.data) {
    notspecificattr.forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });

    let pos = path.centroid({ type: "Point", coordinates: opts.pos });

    layer
      .append("circle")
      .attr("cx", pos[0])
      .attr("cy", pos[1])
      .attr("r", opts.r)
      .attr("visibility", isNaN(pos[0]) ? "hidden" : "visible");
  } else {
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
    let projection =
      opts.coords == "svg"
        ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
        : svg.projection;

    // Dodge
    let data;
    if (opts.dodge) {
      data = JSON.parse(JSON.stringify(opts.data));

      let fet = {
        features: data.features
          .filter((d) => !isNaN(d3.geoPath(projection).centroid(d.geometry)[0]))
          .filter(
            (d) => !isNaN(d3.geoPath(projection).centroid(d.geometry)[1])
          ),
      };

      data = dodge(fet, {
        projection,
        gap: opts.dodgegap,
        r: opts.r,
        k: opts.k,
        fixmax: opts.fixmax,
        iteration: opts.iteration,
      });
      projection = d3.geoIdentity();
    } else {
      data = opts.data;
    }

    // Radius
    let columns = propertiesentries(opts.data);
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
      .selectAll("circle")
      .data(data)
      .join((d) => {
        let n = d
          .append("circle")
          .attr("cx", (d) => path.centroid(d.geometry)[0])
          .attr("cy", (d) => path.centroid(d.geometry)[1])
          .attr("r", (d) => radius(d, opts.r))
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
