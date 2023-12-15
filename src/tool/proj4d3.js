import { geoProjection } from "d3-geo";
const d3 = Object.assign({}, { geoProjection });

/**
 * @description `proj4d3` is a function developped by Philippe Rivière to allow tu use proj4js projections with d3. See https://observablehq.com/@fil/proj4js-d3
 * @see {@link https://observablehq.com/@neocartocnrs/handle-geometries}
 *
 * @param {string} proj4 - the proj4 lib that you have to load
 * @param {string} proj4string - a proj4 projection
 * @example
 * geoviz.tool.proj4d3(proj4, `+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs` )
 * @returns {function} a d3js projection function
 */

export function proj4d3(proj4, crs) {
  const degrees = 180 / Math.PI,
    radians = 1 / degrees,
    raw = proj4(crs),
    p = function (lambda, phi) {
      return raw.forward([lambda * degrees, phi * degrees]);
    };
  p.invert = function (x, y) {
    return raw.inverse([x, y]).map(function (d) {
      return d * radians;
    });
  };
  const projection = d3.geoProjection(p).scale(1);
  projection.raw = raw;
  return projection;
}
