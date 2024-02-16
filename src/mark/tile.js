import { tile as d3tile } from "d3-tile";
import { geoMercator } from "d3-geo";
import { create } from "../container/create";
import { render } from "../container/render";
import { unique } from "../helpers/utils";

/**
 * @description The `tile` function allows to display raster tiles. To use this mark, you must use the projection d3.geoMercator()
 * @see {@link https://observablehq.com/@neocartocnrs/tile-mark}
 *
 * @param {SVGSVGElement} arg1 - SVG container (optional)
 * @param {object} arg2 - options and parameters
 * @param {string} arg2.id - id of the layer
 * @param {number} arg2.tileSize - tile size (default: 512)
 * @param {number} arg2.zoomDelta - zoom offset (default:1)
 * @param {number} arg2.opacity - tile opacity (default: 1)
 * @param {function|string} arg2.url - function like (x, y, z) => \`https://something/\${z}/\${x}/\${y}.png`. You can also enter the following strings directly: "openstreetmap", "opentopomap", "worldterrain", "worldimagery", "worldStreet", "worldphysical" or "shadedrelief".
 * @param {string} arg2.clipPath - clip-path. e.g. "url(#myclipid)"
 * @example
 * geoviz.tile() // no container
 * geoviz.tile(svg, {url: "worldterrain"}) // where svg is the container
 * svg.tile({url: "worldterrain"}) // where svg is the container
 * @returns {SVGSVGElement|string} - the function adds a layer with mercator tiles to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 */

export function tile(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer
    ? create({ projection: geoMercator(), zoomable: true })
    : arg1;

  // Arguments
  const options = {
    mark: "tile",
    id: unique(),
    tileSize: 512,
    zoomDelta: 1,
    increasetilesize: 1,
    opacity: 1,
    clipPath: undefined,
    url: (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  };

  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };
  opts.url = geturl(opts.url);

  // Warning
  if (svg.initproj == "none" && svg.warning) {
    svg.warning_message.push(
      `You must use projection: "mercator" in the svg container to display tile marks`
    );
  }

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

  let tile = d3tile()
    .size([svg.width, svg.height])
    .scale(svg.projection.scale() * 2 * Math.PI)
    .translate(svg.projection([0, 0]))
    .tileSize(opts.tileSize)
    .zoomDelta(opts.zoomDelta);

  layer
    .selectAll("image")
    .data(tile())
    .join("image")
    .attr("xlink:href", (d) => opts.url(...d))
    .attr("x", ([x]) => (x + tile().translate[0]) * tile().scale)
    .attr("y", ([, y]) => (y + tile().translate[1]) * tile().scale)
    .attr("width", tile().scale + opts.increasetilesize + "px")
    .attr("height", tile().scale + opts.increasetilesize + "px")
    .attr("opacity", opts.opacity)
    .attr("clip-path", opts.clipPath);

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}

function geturl(x) {
  let url = (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  switch (typeof x) {
    case "function":
      url = x;
      break;
    case "string":
      url =
        providers.find((d) => d.name == x)?.url ||
        ((x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`);
      break;
  }
  return url;
}

const providers = [
  {
    name: "openstreetmap",
    provider: "OpenStreetMap contributors",
    url: (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  },
  {
    name: "opentopomap",
    provider: "OpenStreetMap contributors",
    url: (x, y, z) => `https://tile.opentopomap.org/${z}/${x}/${y}.png`,
  },
  {
    name: "worldterrain",
    provider: "USGS, Esri, TANA, DeLorme, and NPS",
    url: (x, y, z) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/${z}/${y}/${x}.png`,
  },
  {
    name: "worldimagery",
    provider:
      "Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    url: (x, y, z) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}.png`,
  },
  {
    name: "worldStreet",
    provider:
      "Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
    url: (x, y, z) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}.png`,
  },
  {
    name: "worldphysical",
    provider: "Esri, US National Park Service",
    url: (x, y, z) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/${z}/${y}/${x}`,
  },
  {
    name: "shadedrelief",
    provider: "ESRI",
    url: (x, y, z) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/${z}/${y}/${x}.png`,
  },
];
