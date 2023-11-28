import { create } from "../container/create";
import { render } from "../container/render";
import { centroid } from "../transform/centroid";
import { camelcasetodash } from "../helpers/camelcase";
import { mergeoptions } from "../helpers/mergeoptions";
import { propertiesentries } from "../helpers/propertiesentries";
import { detectinput } from "../helpers/detectinput";
import { implantation } from "../helpers/implantation";
import { getsize } from "../helpers/getsize";
import { order } from "../helpers/order";
import { check } from "../helpers/check";
import { unique } from "../helpers/unique";
import { geoPath, geoIdentity, geoCentroid } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoIdentity, geoCentroid });

export function text(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer
    ? create({ zoomable: true, domain: arg1.data || arg1.datum })
    : arg1;
  // Arguments
  let opts = mergeoptions(
    {
      mark: "text",
      id: unique(),
      strokeWidth: 1,
      text: "text",
      sort: undefined,
      descending: true,
      paintOrder: "stroke",
      strokeLinejoin: "round",
      pos: [0, 0],
    },
    newcontainer ? arg1 : arg2
  );

  if (!opts.data) {
    opts.latlong = opts.latlong ? opts.latlong : false;
    if (opts.latlong) {
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
    opts.latlong = opts.latlong ? opts.latlong : true;
    opts.textAnchor = opts.textAnchor ? opts.textAnchor : "middle";
    opts.dominantBaseline = opts.dominantBaseline
      ? opts.dominantBaseline
      : "middle";
    opts.data =
      implantation(opts.data) == 3
        ? centroid(opts.data, { latlong: opts.latlong })
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
      svg.zoomablelayers.push({
        id: opts.id,
        mark: opts.mark,
        pos: opts.pos,
        latlong: opts.latlong,
        data: opts.data ? true : false,
      });
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id)
      );
      svg.zoomablelayers[i] = {
        id: opts.id,
        mark: opts.mark,
        pos: opts.pos,
        latlong: opts.latlong,
        data: opts.data ? true : false,
      };
    }
  }

  // Specific attributes
  let entries = Object.entries(opts).map((d) => d[0]);
  const notspecificattr = entries.filter(
    (d) =>
      ![
        "mark",
        "id",
        "datum",
        "data",
        "latlong",
        "tip",
        "tipstyle",
        "sort",
        "descending",
      ].includes(d)
  );

  // Projection
  let projection = opts.latlong ? svg.projection : d3.geoIdentity();
  let path = d3.geoPath(projection);

  // Simple text
  if (!opts.data) {
    notspecificattr.forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });

    const pos = path.centroid({ type: "Point", coordinates: opts.pos });
    layer.append("text").text(opts.text).attr("x", pos[0]).attr("y", pos[1]);
  }

  // Labels
  if (opts.data) {
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
    const newheight = getsize(layer).height + opts.pos[1];
    svg
      .attr("width", svg.width)
      .attr("height", newheight)
      .attr("viewBox", [0, 0, svg.width, newheight]);
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
