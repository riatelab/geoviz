import { unique } from "../helpers/unique";
import { tile as d3tile } from "d3-tile";

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

export function tile(
  svg,
  {
    id = unique(),
    tileSize = 256,
    zoomDelta = 1,
    increasetilesize = 1,
    opacity = 1,
    clipPath,
    url = (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  } = {}
) {
  console.log("WARNING - you must use the projection d3.geoMercator()");

  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  let tile = d3tile()
    .size([svg.width, svg.height])
    .scale(svg.projection.scale() * 2 * Math.PI)
    .translate(svg.projection([0, 0]))
    .tileSize(tileSize)
    .zoomDelta(zoomDelta);

  layer
    .selectAll("image")
    .data(tile())
    .join("image")
    .attr("xlink:href", (d) => url(d[0], d[1], d[2]))
    .attr("x", (d) => Math.round((d[0] + tile().translate[0]) * tile().scale))
    .attr("y", (d) => Math.round((d[1] + tile().translate[1]) * tile().scale))
    .attr("width", tile().scale + increasetilesize + "px")
    .attr("height", tile().scale + increasetilesize + "px")
    .attr("opacity", opacity)
    .attr("clip-path", clipPath);

  return `#${id}`;
}
