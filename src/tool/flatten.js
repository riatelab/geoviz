import { geoPath } from "d3-geo";

/**
 * @function flatten
 * @description Projects a GeoJSON FeatureCollection in the coords of the svg document.
 * @param {object} data - GeoJSON FeatureCollection
 * @param {object} options
 * @property {function} options.projection - D3 projection function (e.g., d3.geoOrthographic(), d3.geoMercator())
 * @returns {object} - new GeoJSON FeatureCollection with projected coordinates
 *
 * @example
 * const flattenWorld = geoproject.tool.flatten(svg, world); // where svg is the container
 * const flattenWorld = svg.tool.flatten(world); // where svg is the container
 */
export function flatten(svg, data) {
  const projection = svg.projection;
  if (!projection) return data; // if no projection, return original

  function projectCoords(coords) {
    if (typeof coords[0] === "number") {
      // [lon, lat] => [x, y]
      return projection(coords);
    } else {
      // Array of coordinates (nested for LineString, Polygon, MultiPolygon)
      return coords.map(projectCoords);
    }
  }

  const projectedFeatures = data.features.map((feat) => ({
    ...feat,
    geometry: {
      ...feat.geometry,
      coordinates: projectCoords(feat.geometry.coordinates),
    },
  }));

  return { ...data, features: projectedFeatures };
}
