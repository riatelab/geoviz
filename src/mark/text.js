import { create } from "../container/create";
import { render } from "../container/render";
import { centroid } from "../transform/centroid";
import { camelcasetodash } from "../helpers/camelcase";
import { mergeoptions } from "../helpers/mergeoptions";
import { propertiesentries } from "../helpers/propertiesentries";
import { detectinput } from "../helpers/detectinput";
import { implantation } from "../helpers/implantation";
import { order } from "../helpers/order";
import { check } from "../helpers/check";
import { unique } from "../helpers/unique";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoIdentity });

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
      latlong: true,
      strokeWidth: 1,
      text: "text",
      sort: undefined,
      descending: true,
      paintOrder: "stroke",
      textAnchor: "middle",
      dominantBaseline: "middle",
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

  // Projection
  let projection = opts.latlong ? svg.projection : d3.geoIdentity();

  // Specific attributes
  let entries = Object.entries(opts).map((d) => d[0]);
  const notspecificattr = entries.filter(
    (d) =>
      !["mark", "id", "datum", "data", "latlong", "tip", "tipstyle"].includes(d)
  );

  // layer attributes
  let fields = propertiesentries(opts.data || opts.datum);
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

  // Sort and filter // TODO (ca va pass car le fonction passée n'est pas une fonction de tri)

  let data = opts.data.features
    .filter((d) => d.geometry)
    .filter((d) => d.geometry.coordinates != undefined);

  data = order(data, opts.sort, {
    fields,
    descending: opts.descending,
  });

  // Drawing
  let path = d3.geoPath(projection);
  layer
    .selectAll("text")
    .data(data)
    .join((d) => {
      let n = d
        .append("text")
        .attr("x", (d) => path.centroid(d.geometry)[0])
        .attr("y", (d) => path.centroid(d.geometry)[1])
        .text(opts.text);

      eltattr.forEach((e) => {
        n.attr(camelcasetodash(e), opts[e]);
      });
      return n;
    });

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
