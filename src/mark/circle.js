import { radius as computeradius } from "../classify/radius";
import { mergeoptions } from "../helpers/mergeoptions";
import { dodge } from "../transform/dodge";
import { order } from "../helpers/order";
import { detectinput } from "../helpers/detectinput";
import { propertiesentries } from "../helpers/propertiesentries";
import { create } from "../container/create";
import { render } from "../container/render";
import { tooltip } from "../helpers/tooltip";
import { centroid } from "../transform/centroid";
import { addattr } from "../helpers/addattr";
import { random } from "../classify/random";
import { unique } from "../helpers/unique";
import { implantation } from "../helpers/implantation";
import { scaleSqrt } from "d3-scale";
import { max, descending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { scaleSqrt, max, descending, geoPath, geoIdentity }
);

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
  let opts = mergeoptions(
    {
      mark: "circle",
      id: unique(),
      latlong: true,
      data: undefined,
      r: 10,
      k: 50,
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
    },
    newcontainer ? arg1 : arg2
  );

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Centroid
  opts.data =
    implantation(opts.data) == 3
      ? centroid(opts.data, { latlong: opts.latlong })
      : opts.data;

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

  // ...attr
  addattr({
    layer,
    args: opts,
    exclude: ["fill", "stroke", "r", "sort"],
  });

  // Projection
  let projection =
    opts.latlong == false
      ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
      : svg.projection;

  // Dodge
  let data;
  if (opts.dodge) {
    data = JSON.parse(JSON.stringify(opts.data));

    // PB FILTER (dodge on globe) // TODO
    // let fet = {
    //   features: data.features
    //     .filter(
    //       (d) => !isNaN(d3.geoPath(svg.projection).centroid(d.geometry)[0])
    //     )
    //     .filter(
    //       (d) => !isNaN(d3.geoPath(svg.projection).centroid(d.geometry)[1])
    //     ),
    // };

    data = dodge(data, {
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

  // Draw circles
  layer
    .selectAll("circle")
    .data(data)
    .join("circle")
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
    .attr("fill", opts.fill)
    .attr("stroke", opts.stroke)
    .attr("visibility", (d) =>
      isNaN(d3.geoPath(projection).centroid(d.geometry)[0])
        ? "hidden"
        : "visible"
    );

  // Tooltip
  if (opts.tip) {
    tooltip(layer, opts.data, svg, opts.tip, opts.tipstyle);
  }

  // Output
  if (newcontainer) {
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
