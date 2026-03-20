import { geoPath, geoNaturalEarth1, geoIdentity } from "d3-geo";
import { path } from "d3-path";
import { line, curveBasisClosed } from "d3-shape";
const d3 = Object.assign(
  {},
  { geoPath, geoIdentity, geoNaturalEarth1, path, line, curveBasisClosed },
);
import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash, unique } from "../helpers/utils";
import { simplify as simpl, aggregate } from "geotoolbox";
import rough from "roughjs";

export function sketch(arg1, arg2) {
  // Test if new container
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;

  // Arguments
  const options = {
    simplify: undefined,
    mark: "sketch",
    id: unique(),
    fill: "#37383b",
    coords: "geo",
    stroke: "#000",
    strokeWidth: 1,
    baseFrequency: 0.03,
    feDisplacementMap: 5,
    fillStyle: "dashed",
    roughness: 5,
    hachureGap: 3,
    bowing: 30,
    fillWeight: 0.12,
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // New container
  let svgopts = { projection: d3.geoNaturalEarth1() };
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(0, 4) == "svg_" ? d.slice(4) : d]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

  // Defs

  let defs = svg.select("#defs");
  const pencil1 = defs.append("filter").attr("id", "pencil1");
  pencil1.append("feTurbulence").attr("baseFrequency", opts.baseFrequency);
  pencil1
    .append("feDisplacementMap")
    .attr("in", "SourceGraphic")
    .attr("scale", opts.feDisplacementMap);
  const pencil2 = defs.append("filter").attr("id", "pencil2");
  pencil2.append("feTurbulence").attr("baseFrequency", opts.baseFrequency * 2);
  pencil2
    .append("feDisplacementMap")
    .attr("in", "SourceGraphic")
    .attr("scale", opts.feDisplacementMap + 2);

  // Projection
  let projection =
    opts.coords == "svg"
      ? d3.geoIdentity().scale(svg.zoom.k).translate([svg.zoom.x, svg.zoom.y])
      : svg.projection;

  if (svg.initproj != "none") {
    // init layer
    let layer = svg.selectAll(`#${opts.id}`).empty()
      ? svg.append("g").attr("id", opts.id).attr("data-layer", "outline")
      : svg.select(`#${opts.id}`);
    layer.selectAll("*").remove();

    // zoomable layer
    if (svg.zoomable && !svg.parent) {
      if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
        svg.zoomablelayers.push({
          mark: opts.mark,
          id: opts.id,
        });
      } else {
        let i = svg.zoomablelayers.indexOf(
          svg.zoomablelayers.find((d) => d.id == opts.id),
        );
        svg.zoomablelayers[i] = {
          mark: opts.mark,
          id: opts.id,
        };
      }
    }

    // Manage options
    let entries = Object.entries(opts).map((d) => d[0]);
    const layerattr = entries.filter((d) => !["mark", "id"].includes(d));

    // layer attributes
    layerattr.forEach((d) => {
      layer.attr(camelcasetodash(d), opts[d]);
    });

    // Sketch
    let data = opts.data || opts.datum;
    let land = aggregate(data);
    land = simpl(land, { k: opts.simplify, arcs: 500 });

    // Draw background
    const rc = rough.svg(layer.node());
    layer.node().appendChild(
      rc.path(d3.geoPath(projection)(land), {
        fill: opts.fill,
        stroke: "none",
        roughness: opts.roughness,
        fillStyle: opts.fillStyle,
        hachureGap: opts.hachureGap,
        fillWeight: opts.fillWeight,
        bowing: opts.bowing,
      }),
    );

    // Draw outline

    layer
      .append("path")
      .datum(land)
      .attr("filter", "url(#pencil1)")
      .attr("d", geoCurvePath(d3.curveBasisClosed, projection))
      .attr("fill", "none");

    layer
      .append("path")
      .datum(land)
      .attr("filter", "url(#pencil2)")
      .attr("d", geoCurvePath(d3.curveBasisClosed, projection))
      .attr("fill", "none");

    // Output
    if (newcontainer) {
      return render(svg);
    } else {
      return `#${opts.id}`;
    }
  }
}

// HELPERS

function curveContext(curve) {
  return {
    moveTo(x, y) {
      curve.lineStart();
      curve.point(x, y);
    },
    lineTo(x, y) {
      curve.point(x, y);
    },
    closePath() {
      curve.lineEnd();
    },
  };
}

function geoCurvePath(curve, projection, context) {
  return (object) => {
    const pathContext = context === undefined ? d3.path() : context;
    d3.geoPath(projection, curveContext(curve(pathContext)))(object);
    return context === undefined ? pathContext + "" : undefined;
  };
}
