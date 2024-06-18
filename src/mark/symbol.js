import { scaleSqrt } from "d3-scale";
import { max, descending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { scaleSqrt, max, descending, geoPath, geoIdentity }
);
import { picto } from "../helpers/picto";
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

export function symbol(arg1, arg2) {
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
    mark: "symbol",
    id: unique(),
    data: undefined,
    r: 12,
    symbol: "star",
    missing: "missing",
    rotate: 0,
    skewX: 0,
    skewY: 0,
    background: false,
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
    strokeWidth: 0.2,
    tip: undefined,
    tipstyle: undefined,
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // New container
  let svgopts = { domain: opts.data || opts.datum };
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(0, 4) == "svg_" ? d.slice(4) : d]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

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

  // Background attributes

  let backgroundopts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 11) == "background_" || [].includes(str))
    .forEach((d) =>
      Object.assign(backgroundopts, {
        [d.slice(0, 11) == "background_" ? d.slice(11) : d]: opts[d],
      })
    );

  // Symbol
  const pictoname = picto.map((d) => d.name);
  const symb = new Map(picto.map((d) => [d.name, d.d]));
  const factor = opts.background ? 12 : 10;

  // Projection
  let projection = opts.coords == "svg" ? d3.geoIdentity() : svg.projection;
  let path = d3.geoPath(projection);

  // Simple symbol
  if (!opts.data) {
    let mysymbol = layer.append("g");

    let pos = path.centroid({ type: "Point", coordinates: opts.pos });
    if (opts.background) {
      mysymbol
        .append("circle")
        .attr("r", opts.r)
        .attr("fill", "white")
        .attr("stroke", "none")
        .attr("transform", `translate(${pos})`)
        .attr("visibility", isNaN(pos[0]) ? "hidden" : "visible");
      let m = mysymbol
        .append("circle")
        .attr("r", opts.r)
        .attr("fill", opts.background_fill || opts.fill)
        .attr("fill-opacity", opts.background_fillOpacity || 0.5)
        .attr("stroke", opts.background_stroke || opts.fill)
        .attr("vector-effect", "non-scaling-stroke")
        .attr("transform", `translate(${pos})`)
        .attr("visibility", isNaN(pos[0]) ? "hidden" : "visible");

      Object.entries(backgroundopts)
        .map((d) => d[0])
        .forEach((d) => {
          m.attr(camelcasetodash(d), backgroundopts[d]);
        });
    }
    let n = mysymbol

      .attr("stroke-width", opts.strokeWidth)
      .attr("vector-effect", "non-scaling-stroke")
      .append("path")
      .attr("d", symb.get(opts.symbol))
      .attr(
        "transform",
        `translate(${pos}) rotate(${opts.rotate}) scale(${
          opts.scale || opts.r / factor
        }) skewX(${opts.skewX}) skewY(${opts.skewY})`
      )
      .attr("vector-effect", "non-scaling-stroke")
      .attr("visibility", isNaN(pos[0]) ? "hidden" : "visible");

    notspecificattr.forEach((d) => {
      n.attr(camelcasetodash(d), opts[d]);
    });
  } else {
    //   // Centroid
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

    // eltattr.forEach((d) => {
    //     opts[d] = check(opts[d], fields);
    //   });

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

    // Fields
    let columns = propertiesentries(opts.data);

    // Radius
    let radius = attr2radius(opts.r, {
      columns,
      geojson: opts.data,
      fixmax: opts.fixmax,
      k: opts.k,
    });

    // symbols

    let fieldtosymbol = getsymb(
      opts.order || opts.data.features.map((d) => d.properties[opts.symbol]),
      { symbols: opts.symbols, missing: opts.missing, picto }
    );

    function attr2symbol(attr, { columns, pictoname, symb } = {}) {
      let detect = detectinput(attr, columns);
      if (detect == "function") {
        return attr;
      }
      if (detect == "field") {
        return (d) => symb.get(fieldtosymbol(d.properties[attr]));
      }
      if (detect == "value" && pictoname.includes(attr)) {
        return (d) => symb.get(attr);
      }
      if (detect == "value" && !pictoname.includes(attr)) {
        return (d) => attr;
      }
    }

    let mysymb = attr2symbol(opts.symbol, {
      columns,
      geojson: opts.data,
      missing: opts.missing,
      symbols: opts.symbols,
      pictoname,
      symb,
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
        let mysymbol = d.append("g");

        if (opts.background) {
          mysymbol
            .append("circle")
            .attr("r", (d) => radius(d, opts.r))
            .attr("fill", "white")
            .attr("stroke", "none")
            .attr("transform", (d) => `translate(${path.centroid(d.geometry)})`)
            .attr("visibility", (d) =>
              isNaN(path.centroid(d.geometry)[0]) ? "hidden" : "visible"
            );
          let m = mysymbol
            .append("circle")
            .attr("r", (d) => radius(d, opts.r))
            .attr("fill", opts.background_fill || opts.fill)
            .attr("fill-opacity", opts.background_fillOpacity || 0.5)
            .attr("stroke", opts.background_stroke || opts.fill)
            .attr("vector-effect", "non-scaling-stroke")
            .attr("transform", (d) => `translate(${path.centroid(d.geometry)})`)
            .attr("visibility", (d) =>
              isNaN(path.centroid(d.geometry)[0]) ? "hidden" : "visible"
            );
          Object.entries(backgroundopts)
            .map((d) => d[0])
            .forEach((d) => {
              m.attr(camelcasetodash(d), backgroundopts[d]);
            });
        }

        let n = mysymbol
          .append("path")
          .attr("d", (d) => mysymb(d, opts.symbol))
          .attr("vector-effect", "non-scaling-stroke")
          .attr(
            "transform",
            (d) =>
              `translate(${path.centroid(d.geometry)}) rotate(${
                opts.rotate
              }) scale(${opts.scale || radius(d, opts.r) / factor}) skewX(${
                opts.skewX
              }) skewY(${opts.skewY})`
          )
          .attr("visibility", (d) =>
            isNaN(path.centroid(d.geometry)[0]) ? "hidden" : "visible"
          );

        eltattr.forEach((e) => {
          n.attr(camelcasetodash(e), opts[e]);
        });
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

function getsymb(data, { symbols = undefined, missing = "beer", picto } = {}) {
  let arr = data.filter((d) => d !== "" && d != null && d != undefined);
  let types = Array.from(new Set(arr));
  const arrsymb = symbols || picto.slice(0, types.length).map((d) => d.name);

  const symbolmap = new Map(types.map((d, i) => [d, arrsymb[i]]));

  return function (d) {
    if (types.includes(d)) {
      return symbolmap.get(d);
    } else if (typeof missing === "string") {
      return missing;
    }
  };
}
