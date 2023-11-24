import { unique } from "../helpers/unique";
import { mergeoptions } from "../helpers/mergeoptions";
import { tile as d3tile } from "d3-tile";
import { geoMercator } from "d3-geo";
import { create } from "../container/create";
import { render } from "../container/render";

/**
 * The `titke` function allows to display raster tiles
 * WARNING - you must use the projection d3.geoMercator()
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id of the layer
 * @param {number} options.tileSize - tile size
 * @param {number} options.zoomDelta - zoom offset
 * @param {number} options.opacity - tile opacity
 * @param {function} options.url - tile style
 * @param {string} options.clipPath - clip-path. e.g. "url(#myclipid)"
 *
 * let tiles = geoviz.layer.tile(main, {  url : (x, y, z) =>
    `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}.png`})
 * @returns {SVGSVGElement|string} - the function adds a layer with mercator tiles to the SVG container and returns the layer identifier.
 */

export function tile(arg1, arg2) {
  // Warning
  console.log(
    "WARNING - to display tiles, you must use the projection d3.geoMercator()"
  );

  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer
    ? create({ projection: geoMercator(), zoomable: true })
    : arg1;

  // Arguments
  let opts = mergeoptions(
    {
      mark: "tile",
      id: unique(),
      tileSize: 512,
      zoomDelta: 1,
      increasetilesize: 1,
      opacity: 1,
      clipPath: undefined,
      url: (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
    },
    newcontainer ? arg1 : arg2
  );

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
