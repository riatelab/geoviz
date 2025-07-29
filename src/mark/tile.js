import { tile as d3tile } from "d3-tile";
import { geoMercator } from "d3-geo";
import { create } from "../container/create";
import { render } from "../container/render";
import { unique } from "../helpers/utils";

/**
 * @function tile
 * @description The `tile` function allows to display raster tiles. To use this mark, you must use the projection d3.geoMercator() (or directly "mercator"). The function adds a layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/tile-mark}
 *
 * @property {string} [id] - id of the layer
 * @property {number} [tileSize = 512] - tile size
 * @property {number} [zoomDelta = 1] - zoom offset
 * @property {number} [opacity = 1] - tile opacity
 * @property {function|string} [url = "openstreetmap"] - function like <code>(x, y, z) => \`https://something/\${z}/\${x}/\${y}.png\`</code>. You can also enter the following strings directly: "openstreetmap", "opentopomap", "worldterrain", "worldimagery", "worldStreet", "worldphysical", "shadedrelief", "stamenterrain", "cartodbvoyager", "stamentoner","stamentonerbackground","stamentonerlite","stamenwatercolor","hillshade","worldocean","natgeo" or "worldterrain".
 * @property {string} [clipPath] - clip-path. e.g. "url(#myclipid)"
 * @property {*} [svg_*]  - *parameters of the svg container created if the layer is not called inside a container (e.g svg_width)*
 * @example
 * // There are several ways to use this function
 * geoviz.tile() // no container
 * geoviz.tile(svg, {url: "worldterrain"}) // where svg is the container
 * svg.tile({url: "worldterrain"}) // where svg is the container
 * svg.plot({type: "tile", url: "worldterrain"}) // where svg is the container
 */

export function tile(arg1, arg2) {
  // Test if new container
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  // let svg = newcontainer
  //   ? create({ projection: geoMercator(), zoomable: true })
  //   : arg1;

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

  // New container
  let svgopts = { zoomable: true, projection: geoMercator() };
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(0, 4) == "svg_" ? d.slice(4) : d]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

  

  // Warning
  if (svg.initproj == "none" && svg.warning) {
    svg.warning_message.push(
      `You must use projection: "mercator" in the svg container to display tile marks`
    );
  }

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id).attr("data-layer", "tile")
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

  {
    name: "stamenterrain",
    provider: "stadiamaps",
    url: (x, y, z) =>
      `https://tiles.stadiamaps.com/tiles/stamen_terrain/${z}/${x}/${y}${
        devicePixelRatio > 1 ? "@2x" : ""
      }.png`,
  },

  {
    name: "cartodbvoyager",
    provider: "CartoDB",
    url: (x, y, z) =>
      `https://${
        "abc"[Math.abs(x + y) % 3]
      }.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}${
        devicePixelRatio > 1 ? "@2x" : ""
      }.png`,
  },

  {
    name: "stamentoner",
    provider: "stadiamaps",
    url: (x, y, z) =>
      `https://tiles.stadiamaps.com/tiles/stamen_toner/${z}/${x}/${y}${
        devicePixelRatio > 1 ? "@2x" : ""
      }.png`,
  },
  {
    name: "stamentonerbackground",
    provider: "stadiamaps",
    url: (x, y, z) =>
      `https://tiles.stadiamaps.com/tiles/stamen_toner_background/${z}/${x}/${y}${
        devicePixelRatio > 1 ? "@2x" : ""
      }.png`,
  },
  {
    name: "stamentonerlite",
    provider: "stadiamaps",
    url: (x, y, z) =>
      `https://tiles.stadiamaps.com/tiles/stamen_toner_lite/${z}/${x}/${y}${
        devicePixelRatio > 1 ? "@2x" : ""
      }.png`,
  },
  {
    name: "stamenwatercolor",
    provider: "stadiamaps",
    url: (x, y, z) =>
      `https://tiles.stadiamaps.com/tiles/stamen_watercolor/${z}/${x}/${y}.jpg`,
  },
  {
    name: "hillshade",
    provider: "ESRI",
    url: (x, y, z) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/${z}/${y}/${x}.png`,
  },

  {
    name: "worldocean",
    provider: "ESRI",
    url: (x, y, z) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/${z}/${y}/${x}`,
  },
  {
    name: "natgeo",
    provider: "ESRI",
    url: (x, y, z) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/${z}/${y}/${x}`,
  },

  {
    name: "worldterrain",
    provider: "ESRI",
    url: (x, y, z) =>
      `  https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/${z}/${y}/${x}`,
  },
];
