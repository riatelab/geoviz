import { forceX, forceY, forceCollide, forceSimulation } from "d3-force";
import { max } from "d3-array";
import { scaleSqrt } from "d3-scale";
const d3 = Object.assign(
  {},
  { forceX, forceY, forceCollide, forceSimulation, max, scaleSqrt }
);
import { propertiesentries, detectinput } from "../helpers/utils";

/**
 * @function tool/dodge
 * @description The `tool.dodge` function use d3.forceSimulation to spread dots or circles of  given in a GeoJSON FeatureCollection (points). It returns the coordinates in the page map. It can be used to create a dorling cartogram. The function returns a GeoJSON FeatureCollection (points) with coordinates in the page map.
 * @see {@link https://observablehq.com/@neocartocnrs/world-population}
 * @property {object} data - a GeoJSON FeatureCollection
 * @property {function} [options.projection = d => d] - d3 projection function
 * @property {number|string} [options.r = 10] - a number or the name of a property containing numerical values.
 * @property {number} [options.k = 50] - radius of the largest circle (or corresponding to the value defined by `fixmax`)
 * @property {number} [options.fixmax = null] - value matching the circle with radius `k`. Setting this value is useful for making maps comparable with each other
 * @property {number} [options.iteration = 200] - number of iterations
 * @property {number} [options.gap = 0] - space between points/circles
 * @example
 * let dots = geoviz.tool.dodge(world, { projection: d3.geoOrthographic(), r: "population", k: 40 })
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
  let rawfeatures = JSON.parse(JSON.stringify(data))
    .features.filter((d) => d.geometry)
    .filter((d) => d.geometry.coordinates != undefined);

  let features = JSON.parse(JSON.stringify(rawfeatures));

  let simulation;

  // r input type
  let columns = propertiesentries(data);

  if (detectinput(r, columns) == "field") {
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

  if (detectinput(r, columns) == "function") {
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
      .force("collide", d3.forceCollide(r));
  }

  if (detectinput(r, columns) == "value") {
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

  rawfeatures.map(
    (d, i) => (d.geometry.coordinates = [features[i].x, features[i].y])
  );

  return { type: "FeatureCollection", crs: null, features: rawfeatures };
}
