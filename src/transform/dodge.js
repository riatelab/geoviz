import { forceX, forceY, forceCollide, forceSimulation } from "d3-force";
import { max } from "d3-array";
import { scaleSqrt } from "d3-scale";
const d3 = Object.assign(
  {},
  { forceX, forceY, forceCollide, forceSimulation, max, scaleSqrt }
);

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
