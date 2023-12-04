import { scaleSqrt } from "d3-scale";
import { max, descending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { scaleSqrt, max, descending, geoPath, geoIdentity }
);
import { create } from "../container/create";
import { render } from "../container/render";
import { random } from "../classify/random";
import { radius as computeradius } from "../classify/radius";
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
 * The `circle` function allows to create a layer with circles from a geoJSON (points)
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {object} options.data - GeoJSON FeatureCollection (points)
 * @param {string} options.id - id of the layer
 * @param {number|string} options.r - a number or the name of a property containing numerical values.
 * @param {number} options.k - radius of the largest circle (or corresponding to the value defined by `fixmax`)
 * @param {number} options.fixmax - value matching the circle with radius `k`. Setting this value is useful for making maps comparable with each other
 * @param {string|function} options.projection - use "none" if the coordinates are already in the plan of the page. If this field is left blank, the global container projection is applied.
 * @param {string|function} options.fill - fill color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {string|function} options.stroke - stroke color. To create choropleth maps or typologies, use the `classify.choro` and `classify.topo` functions
 * @param {boolean|function} options.tip - a function to display the tip. Use true tu display all fields
 * @param {object} options.tipstyle - tooltip style
 * @param {*} options.foo - *other attributes that can be used to define the svg style (strokeDasharray, strokeWidth, opacity, strokeLinecap...)*
 * @example
 * let circles = geoviz.layer.bubble(main, { data: cities, r: "population" })
 * @returns {SVGSVGElement|string} - the function adds a layer with circles to the SVG container and returns the layer identifier.
 */

export function circle(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create({ zoomable: true, domain: arg1.data }) : arg1;

  // Arguments
  const options = {
    mark: "circle",
    id: unique(),
    latlong: true,
    data: undefined,
    r: 10,
    k: 50,
    pos: [0, 0],
    anchor: "middle",
    baseline: "middle",
    sort: undefined,
    dodge: false,
    dodgegap: 0,
    iteration: 200,
    descending: true,
    fixmax: null,
    fill: random(),
    stroke: "white",
    dx: 0,
    dy: 0,
    tip: undefined,
    tipstyle: undefined,
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

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
      ![
        "mark",
        "id",
        "latlong",
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
  let projection = opts.latlong ? svg.projection : d3.geoIdentity();
  let path = d3.geoPath(projection);

  // Simple circle
  if (!opts.data) {
    opts.latlong = opts.latlong ? opts.latlong : false;
    notspecificattr.forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });

    let pos = path.centroid({ type: "Point", coordinates: opts.pos });
    pos[0] = pos[0] + opts.dx;
    pos[1] = pos[1] + opts.dy;

    layer
      .append("circle")
      .attr("cx", pos[0])
      .attr("cy", pos[1])
      .attr("r", opts.r);
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
    // let projection =
    //   opts.latlong == false
    //     ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
    //     : svg.projection;
    // let projection = opts.latlong ? svg.projection : d3.geoIdentity();

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

    // DominantBeseline
    let baseline = 0;
    switch (opts.baseline) {
      case "bottom":
        baseline = -1;
        break;
      case "top":
        baseline = 1;
        break;
    }
    // Anchor
    let anchor = 0;
    switch (opts.anchor) {
      case "start":
        anchor = -1;
        break;
      case "end":
        anchor = 1;
        break;
    }

    // Drawing
    path = d3.geoPath(projection);
    layer
      .selectAll("circle")
      .data(data)
      .join((d) => {
        let n = d
          .append("circle")
          .attr(
            "cx",
            (d) =>
              d3.geoPath(projection).centroid(d.geometry)[0] +
              radius(d, opts.r) * anchor
          )
          .attr(
            "cy",
            (d) =>
              d3.geoPath(projection).centroid(d.geometry)[1] +
              radius(d, opts.r) * baseline
          )
          .attr("r", (d) => radius(d, opts.r))

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
      return (d, r) => radius(d.properties[r]);
    case "value":
      return (d) => attr;
  }
}
