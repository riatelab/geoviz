import { forceX, forceY, forceCollide, forceSimulation } from "d3-force";
import { max } from "d3-array";
import { scaleSqrt } from "d3-scale";
const d3 = Object.assign(
  {},
  { forceX, forceY, forceCollide, forceSimulation, max, scaleSqrt }
);

/**
 * This function use d3.forceSimulation to spread dots or circles of  given in a GeoJSON FeatureCollection (points).
 * It returns the coordinates in the page map. It can be used to create a dorling cartogram
 *
 * @param {object} data - A GeoJSON FeatureCollection
 * @param {object} param1 - Options
 * @param {function} param1.projection - d3 projection function
 * @param {boolean} param1.geocoords - Use `true` if input coordinates are in latitude ans longitude. Use `false` if the coordinates are already defined in the page plan
 * @param {number|string} param1.r - a number or the name of a property containing numerical values.
 * @param {number} param1.k - Radius of the largest circle (or corresponding to the value defined by `fixmax`)
 * @param {number} param1.fixmax - Value matching the circle with radius `k`. Setting this value is useful for making maps comparable with each other
 * @param {number} param1.iteration - Number of iterations
 * @param {number} param1.gap - Space between points/circles
 * @example
 * let dots = transform.dodge(world, { projection: d3.geoOrthographic(), r: "population", k: 40 })
 * @returns {object} - A GeoJSON FeatureCollection (points) with coordinates in the page map.
 */

export function dodge(
  data,
  {
    projection = (d) => d,
    iteration = 200,
    r = 10,
    k = 50,
    fixmax = null,
    gap = 0,
  } = {}
) {
  let features = JSON.parse(JSON.stringify(data)).features;
  let simulation;
  if (typeof r == "string") {
    const valmax =
      fixmax != undefined
        ? fixmax
        : d3.max(features, (d) => Math.abs(+d.properties[r]));
    let radius = d3.scaleSqrt([0, valmax], [0, k]);

    simulation = d3
      .forceSimulation(features)
      .force(
        "x",
        d3.forceX((d) => projection(d.geometry.coordinates)[0])
      )
      .force(
        "y",
        d3.forceY((d) => projection(d.geometry.coordinates)[1])
      )
      .force(
        "collide",
        d3.forceCollide((d) => radius(Math.abs(d.properties[r])) + gap)
      );
  }

  if (typeof r == "number") {
    features = features.filter((d) => d.geometry.coordinates != undefined);
    simulation = d3
      .forceSimulation(features)
      .force(
        "x",
        d3.forceX((d) => projection(d.geometry.coordinates)[0])
      )
      .force(
        "y",
        d3.forceY((d) => projection(d.geometry.coordinates)[1])
      )
      .force("collide", d3.forceCollide(r + gap));
  }

  for (let i = 0; i < iteration; i++) {
    simulation.tick();
  }

  data.features.map(
    (d, i) => (d.geometry.coordinates = [features[i].x, features[i].y])
  );

  return { type: "FeatureCollection", crs: null, features: data.features };
}
