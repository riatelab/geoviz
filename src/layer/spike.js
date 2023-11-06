import { tooltip } from "../helpers/tooltip";
import { zoomclass } from "../helpers/zoomclass";
import { addattr } from "../helpers/addattr";
import { random } from "../classify/random";
import { unique } from "../helpers/unique";
import { scaleLinear } from "d3-scale";
import { max, descending } from "d3-array";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { scaleLinear, max, descending, geoPath, geoIdentity }
);

export function spike(
  svg,
  {
    id = unique(),
    projection,
    data,
    height,
    width = 10,
    k = 50,
    fixmax = null,
    fill = "red",
    fillOpacity = 0.5,
    stroke = "none",
    tip,
    tipstyle,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg
        .append("g")
        .attr("id", id)
        .attr("class", svg.inset ? "nozoom" : "zoomablespike")
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fill", "stroke", "transform"],
  });

  // Projection
  projection = projection == "none" ? d3.geoIdentity() : svg.projection;

  // layer data
  layer.attr(
    "data-layer",
    JSON.stringify({
      width,
      height,
      k,
      fixmax,
      features: data.features,
    })
  );

  if (typeof height == "string") {
    const valmax =
      fixmax != undefined
        ? fixmax
        : d3.max(data.features, (d) => Math.abs(+d.properties[height]));
    const yScale = d3.scaleLinear().domain([0, valmax]).range([0, k]);

    layer
      .selectAll("path")
      .data(
        data.features
          .filter((d) => d.geometry)
          .filter((d) => d.properties[height] != undefined)
          .sort((a, b) =>
            d3.descending(
              Math.abs(+a.properties[height]),
              Math.abs(+b.properties[height])
            )
          )
      )
      .join("path")
      .attr(
        "d",
        (d) =>
          `M ${d3.geoPath(projection).centroid(d.geometry)[0] - width / 2}, ${
            d3.geoPath(projection).centroid(d.geometry)[1]
          } ${d3.geoPath(projection).centroid(d.geometry)[0]}, ${
            d3.geoPath(projection).centroid(d.geometry)[1] -
            yScale(d.properties[height])
          } ${d3.geoPath(projection).centroid(d.geometry)[0] + width / 2}, ${
            d3.geoPath(projection).centroid(d.geometry)[1]
          }`
      )
      .attr("fill", fill)
      .attr("stroke", stroke)
      .attr("visibility", (d) =>
        isNaN(d3.geoPath(projection).centroid(d.geometry)[0])
          ? "hidden"
          : "visible"
      );
  }

  if (typeof height == "number") {
    layer
      .selectAll("path")
      .data(data.features.filter((d) => d.geometry))
      .join("path")

      .attr(
        "d",
        (d) =>
          `M ${d3.geoPath(projection).centroid(d.geometry)[0] - width / 2}, ${
            d3.geoPath(projection).centroid(d.geometry)[1]
          } ${d3.geoPath(projection).centroid(d.geometry)[0]}, ${
            d3.geoPath(projection).centroid(d.geometry)[1] - height
          } ${d3.geoPath(projection).centroid(d.geometry)[0] + width / 2}, ${
            d3.geoPath(projection).centroid(d.geometry)[1]
          }`
      )
      .attr("fill", fill)
      .attr("stroke", stroke)
      .attr("visibility", (d) =>
        isNaN(d3.geoPath(projection).centroid(d.geometry)[0])
          ? "hidden"
          : "visible"
      );
  }

  if (tip) {
    tooltip(layer, data, svg, tip, tipstyle);
  }

  return `#${id}`;
}
