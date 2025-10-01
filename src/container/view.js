import { create } from "./create";
import { featurecollection } from "./tool/featurecollection";
export function draw(arr, { width = 1000 } = {}) {
  arr = arr.map((d) => featurecollection(d));
  const colors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
    "#393b79",
    "#637939",
    "#8c6d31",
    "#843c39",
    "#7b4173",
    "#5254a3",
    "#9c9ede",
    "#6b6ecf",
    "#9c9ede",
    "#637939",
  ];
  let svg = viz.create({
    domain: arr,
    zoomable: true,
    width,
    margin: 10,
    projection: "equirectangular",
  });
  arr.forEach((d, i) => {
    svg.path({ data: d, fill: colors[i] });
  });
  return svg.render();
}
