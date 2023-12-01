import { mergeoptions } from "../helpers/mergeoptions";
import { check } from "../helpers/check";
import { propertiesentries } from "../helpers/propertiesentries";
import { order } from "../helpers/order";
import { detectinput } from "../helpers/detectinput";
import { create } from "../container/create";
import { render } from "../container/render";
import { tooltip } from "../helpers/tooltip";
import { centroid } from "../tool/centroid";
import { addattr } from "../helpers/addattr";
import { random } from "../classify/random";
import { unique } from "../helpers/unique";
import { implantation } from "../helpers/implantation";
import { scaleLinear } from "d3-scale";
import { max, descending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { scaleLinear, max, descending, geoPath, geoIdentity }
);

export function triangle(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create({ zoomable: true, domain: arg1.data }) : arg1;

  // Arguments
  let opts = mergeoptions(
    {
      mark: "triangle",
      id: unique(),
      latlong: true,
      data: undefined,
      height: 10,
      width: 10,
      reverse: false,
      k: 50,
      anchor: "middle",
      baseline: "middle",
      sort: undefined,
      descending: true,
      fixmax: null,
      fill: random(),
      stroke: "white",
      dx: 0,
      dy: 0,
      tip: undefined,
      tipstyle: undefined,
      rotate: 0,
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

  // Arguments to functions
  const fields = propertiesentries(opts.data);
  ["text", "fill"].forEach((d) => {
    opts[d] = check(opts[d], fields);
  });

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

  // Y scale
  const yScale = (d) => d;
  //   const yScale =
  //   opts.height == "___const"
  //     ? (d) => d
  //     : d3.scaleLinear().domain([0, valmax]).range([0, opts.k]);

  // ...attr
  addattr({
    layer,
    args: opts,
    exclude: ["fill", "stroke", "width", "height", "sort", "transform"],
  });

  // Projection
  let projection =
    opts.latlong == false
      ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
      : svg.projection;

  // Sort & filter
  let data = opts.data.features
    .filter((d) => d.geometry)
    .filter((d) => d.geometry.coordinates != undefined);
  if (detectinput(opts.r, fields) == "field") {
    data = data.filter((d) => d.properties[opts.r] != undefined);
  }
  data = order(data, opts.sort || opts.r, {
    fields,
    descending: opts.descending,
  });

  // DominantBeseline
  let baseline = 1;
  let baseline2 = 0;
  let baseline3 = 0;
  let baseline4 = 1;
  switch (opts.baseline) {
    case "bottom":
      baseline = 0;
      baseline2 = 2;
      baseline4 = 0;
      break;
    case "top":
      baseline = 2;
      baseline2 = 0;
      baseline3 = -2;
      baseline4 = 0;
      break;
  }
  // Anchor
  let anchor = -1;
  switch (opts.anchor) {
    case "start":
      anchor = 0;
      break;
    case "end":
      anchor = -2;
      break;
  }

  // Updown
  let updown = opts.reverse ? -1 : 1;

  // Draw trangles

  layer
    .selectAll("path")
    .data(data)
    .join("path")
    .attr(
      "d",
      (d) =>
        `M ${
          d3.geoPath(projection).centroid(d.geometry)[0] +
          (opts.width / 2) * anchor
        }, ${
          d3.geoPath(projection).centroid(d.geometry)[1] +
          (baseline * opts.height) / 2 +
          baseline3 * opts.height -
          baseline4 * opts.height
        } ${
          d3.geoPath(projection).centroid(d.geometry)[0] +
          opts.width / 2 +
          (anchor * opts.width) / 2
        }, ${
          d3.geoPath(projection).centroid(d.geometry)[1] -
          opts.height +
          (baseline * opts.height) / 2 +
          baseline2 * opts.height +
          baseline4 * opts.height
        } ${
          d3.geoPath(projection).centroid(d.geometry)[0] +
          opts.width +
          (anchor * opts.width) / 2
        }, ${
          d3.geoPath(projection).centroid(d.geometry)[1] +
          (baseline * opts.height) / 2 +
          baseline3 * opts.height -
          baseline4 * opts.height
        }`
    )
    // .attr(
    //   "d",
    //   (d) =>
    //     `M ${
    //       d3.geoPath(projection).centroid(d.geometry)[0] - opts.width / 2
    //     }, ${d3.geoPath(projection).centroid(d.geometry)[1]} ${
    //       d3.geoPath(projection).centroid(d.geometry)[0]
    //     }, ${
    //       d3.geoPath(projection).centroid(d.geometry)[1] - opts.height * updown
    //     } ${d3.geoPath(projection).centroid(d.geometry)[0] + opts.width / 2}, ${
    //       d3.geoPath(projection).centroid(d.geometry)[1]
    //     }`
    // )
    .attr("fill", opts.fill)
    .attr("stroke", opts.stroke)
    .attr("visibility", (d) =>
      isNaN(d3.geoPath(projection).centroid(d.geometry)[0])
        ? "hidden"
        : "visible"
    );
  // .attr(
  //   "transform",
  //   (d) =>
  //     `rotate(${opts.rotate} ${
  //       d3.geoPath(projection).centroid(d.geometry)[0]
  //     } ${d3.geoPath(projection).centroid(d.geometry)[1]})`
  // );

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
