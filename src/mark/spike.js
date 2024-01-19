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
    k: 50,
    w: 30,
    h: 100,
    pos: [0, 0],
    curve: 0,
    sort: undefined,
    descending: true,
    fixmax: null,
    fill: "#c72e94",
    stroke: "black",
    fillOpacity: 0.3,
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
        "r",
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
  // TODO
  if (!opts.data) {
    notspecificattr.forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });

    let pos = path.centroid({ type: "Point", coordinates: opts.pos });

    // layer
    //   .append("circle")
    //   .attr("cx", pos[0])
    //   .attr("cy", pos[1])
    //   .attr("r", opts.r)
    //   .attr("visibility", isNaN(pos[0]) ? "hidden" : "visible");
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

    // data
    let data = opts.data;

    // Height
    let columns = propertiesentries(opts.data);
    let yscale = attr2yscale(opts.h, {
      columns,
      geojson: data,
      fixmax: opts.fixmax,
      k: opts.k,
    });

    // Sort & filter
    data = data.features
      .filter((d) => d.geometry)
      .filter((d) => d.geometry.coordinates != undefined);
    if (detectinput(opts.h, columns) == "field") {
      data = data.filter((d) => d.properties[opts.h] != undefined);
    }
    data = order(data, opts.sort || opts.h, {
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
            "d",
            (d) =>
              `m ${path.centroid(d.geometry)[0] - opts.w / 2},${
                path.centroid(d.geometry)[1]
              } Q ${path.centroid(d.geometry)[0]},${
                path.centroid(d.geometry)[1] - yscale(d, opts.h) * opts.curve
              },${path.centroid(d.geometry)[0]} ${
                path.centroid(d.geometry)[1] - yscale(d, opts.h)
              }
               Q ${path.centroid(d.geometry)[0]}, ${
                path.centroid(d.geometry)[1] - yscale(d, opts.h) * opts.curve
              } ${path.centroid(d.geometry)[0] + opts.w / 2},${
                path.centroid(d.geometry)[1]
              }`
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

// convert h attribute to yscale function

function attr2yscale(attr, { columns, geojson, fixmax, k } = {}) {
  switch (detectinput(attr, columns)) {
    case "function":
      return attr;
    case "field":
      let height = computeheight(
        geojson.features.map((d) => d.properties[attr]),
        {
          fixmax,
          k,
        }
      );
      return (d, hh) => height.h(d.properties[hh]);
    case "value":
      return (d) => attr;
  }
}
