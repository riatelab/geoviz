import { zoom, zoomTransform } from "d3-zoom";
import { geoPath, geoIdentity } from "d3-geo";
import { tile } from "d3-tile";
import { northangle } from "../helpers/northangle";
import * as geoScaleBar from "d3-geo-scale-bar";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";

const d3 = Object.assign({}, geoScaleBar, {
  zoom,
  geoPath,
  geoIdentity,
  zoomTransform,
  tile,
  select,
  scaleLinear,
  max,
});

export function zoomandpan(svg) {
  let noproj = d3.geoIdentity();
  function zoom({ transform }) {
    // Adapt projection
    svg.projection
      .scale(transform.k * svg.baseScale)
      .translate([
        svg.baseTranslate[0] * transform.k + transform.x,
        svg.baseTranslate[1] * transform.k + transform.y,
      ]);
    noproj.scale(transform.k).translate([transform.x, transform.y]);
    render(transform);
  }

  function reset() {
    d3.zoomTransform(this).k = 1;
    d3.zoomTransform(this).x = 0;
    d3.zoomTransform(this).y = 0;
    svg.projection.scale(svg.baseScale).translate(svg.baseTranslate);
    d3.geoIdentity().scale(1).translate([0, 0]);
    render({ k: 1, x: 0, y: 0 });
  }

  function render(t) {
    // Path
    const path = d3.geoPath(svg.projection);
    svg.selectAll(".zoomable > path").attr("d", path);
    const path2 = d3.geoPath(noproj);
    svg.selectAll(".zoomable2 > path").attr("d", path2);

    // ClipPath
    svg.selectAll(".zoomable > clipPath > path").attr("d", path);

    // Outline
    svg
      .selectAll(".zoomableoutline > path")
      .attr("d", d3.geoPath(svg.projection)({ type: "Sphere" }));

    // Circles
    svg
      .selectAll(".zoomable > circle")
      .attr("cx", (d) => d3.geoPath(svg.projection).centroid(d.geometry)[0])
      .attr("cy", (d) => d3.geoPath(svg.projection).centroid(d.geometry)[1])
      .attr("visibility", (d) =>
        isNaN(d3.geoPath(svg.projection).centroid(d.geometry)[0])
          ? "hidden"
          : "visible"
      );
    svg
      .selectAll(".zoomable2 > circle")
      .attr("cx", (d) => noproj(d.geometry.coordinates)[0])
      .attr("cy", (d) => noproj(d.geometry.coordinates)[1])
      .attr("visibility", (d) =>
        isNaN(d3.geoPath(svg.projection).centroid(d.geometry)[0])
          ? "hidden"
          : "visible"
      );
    // Texts
    svg
      .selectAll(".zoomable > text")
      .attr("x", (d) => d3.geoPath(svg.projection).centroid(d.geometry)[0])
      .attr("y", (d) => d3.geoPath(svg.projection).centroid(d.geometry)[1])
      .attr("visibility", (d) =>
        isNaN(d3.geoPath(svg.projection).centroid(d.geometry)[0])
          ? "hidden"
          : "visible"
      );
    svg
      .selectAll(".zoomable2 > text")
      .attr("x", (d) => noproj(d.geometry.coordinates)[0])
      .attr("y", (d) => noproj(d.geometry.coordinates)[1]);

    // Spikes
    let spikenodes = svg.selectAll(".zoomablespike");
    for (let i = 0; i < spikenodes.size(); i++) {
      let n = d3.select(spikenodes.nodes()[i]);
      const datalayer = JSON.parse(n.attr("data-layer"));
      const valmax =
        datalayer.fixmax != undefined
          ? datalayer.fixmax
          : d3.max(datalayer.features, (d) =>
              Math.abs(+d.properties[datalayer.height])
            );
      const yScale =
        datalayer.height == "___const"
          ? (d) => d
          : d3.scaleLinear().domain([0, valmax]).range([0, datalayer.k]);

      let projection = datalayer.prj == "none" ? noproj : svg.projection;

      n.selectAll("path").attr(
        "d",
        (d) =>
          `M ${
            d3.geoPath(projection).centroid(d.geometry)[0] - datalayer.width / 2
          }, ${d3.geoPath(projection).centroid(d.geometry)[1]} ${
            d3.geoPath(projection).centroid(d.geometry)[0]
          }, ${
            d3.geoPath(projection).centroid(d.geometry)[1] -
            yScale(d.properties[datalayer.height] * datalayer.updown)
          } ${
            d3.geoPath(projection).centroid(d.geometry)[0] + datalayer.width / 2
          }, ${d3.geoPath(projection).centroid(d.geometry)[1]}`
      );
    }

    //Scalebar
    if (!svg.selectAll(".zoomablescalebar").empty()) {
      let scalebarnodes = svg.selectAll(".zoomablescalebar");
      scalebarnodes.selectAll("*").remove();
      for (let i = 0; i < scalebarnodes.size(); i++) {
        let n = d3.select(scalebarnodes.nodes()[i]);
        const datalayer = JSON.parse(n.attr("data-layer"));
        n.call(
          d3
            .geoScaleBar()
            .projection(svg.projection)
            .size([svg.width, svg.height])
            .left(datalayer.left)
            .top(datalayer.top)
            .distance(datalayer.distance)
            .label(datalayer.label)
            .units(datalayer.units)
            .tickPadding(datalayer.tickPadding)
            .tickSize(datalayer.tickSize)
            .tickFormat(eval(datalayer.tickFormat))
            .tickValues(datalayer.tickValues)
            .labelAnchor(datalayer.labelAnchor)
        );

        if (datalayer.translate) {
          n.attr(
            "transform",
            `translate(${datalayer.pos[0] + datalayer.translate[0]},${
              datalayer.pos[1] + datalayer.translate[1]
            })`
          ).attr("visibility", (d) =>
            isNaN(d3.geoPath(svg.projection).centroid(d.geometry)[0])
              ? "hidden"
              : "visible"
          );
        }
      }
    }

    // Tiles

    if (!svg.selectAll(".zoomabletiles").empty()) {
      let tilesnodes = svg.selectAll(".zoomabletiles");
      tilesnodes.selectAll("*").remove();

      for (let i = 0; i < tilesnodes.size(); i++) {
        let n = d3.select(tilesnodes.nodes()[i]);
        const datalayer = JSON.parse(n.attr("data-layer"));
        const url = eval(datalayer.url);
        let tile = d3
          .tile()
          .size([svg.width, svg.height])
          .scale(svg.projection.scale() * 2 * Math.PI)
          .translate(svg.projection([0, 0]))
          .tileSize(datalayer.tileSize)
          .zoomDelta(datalayer.zoomDelta);
        n.selectAll("image")
          .data(tile(), (d) => d)
          .join("image")
          .attr("xlink:href", (d) => url(...d))
          .attr("x", ([x]) => (x + tile().translate[0]) * tile().scale)
          .attr("y", ([, y]) => (y + tile().translate[1]) * tile().scale)
          .attr("width", tile().scale + datalayer.increasetilesize + "px")
          .attr("height", tile().scale + datalayer.increasetilesize + "px")
          .attr("opacity", datalayer.opacity)
          .attr("clip-path", datalayer.clipPath);
      }
    }

    // North arrow

    if (!svg.selectAll(".zoomablenorth").empty()) {
      let northnodes = svg.selectAll(".zoomablenorth");
      northnodes.selectAll("*").remove();
      for (let i = 0; i < northnodes.size(); i++) {
        let n = d3.select(northnodes.nodes()[i]);
        const datalayer = JSON.parse(n.attr("data-layer"));
        n.append("path")
          .attr("d", datalayer.symbol)
          .attr("fill", datalayer.fill)
          .attr("fill-opacity", datalayer.fillOpacity)
          .attr(
            "transform",
            `translate(${datalayer.pos[0]},${datalayer.pos[1]}) rotate(${
              datalayer.rotate === null
                ? northangle(datalayer.pos, svg.projection)
                : datalayer.rotate
            }) scale(${datalayer.scale})`
          );
      }
    }
  }

  svg.call(
    d3
      .zoom()
      .extent([
        [0, 0],
        [svg.width, svg.height],
      ])
      .scaleExtent(Array.isArray(svg.zoomable) ? svg.zoomable : [1, 8])
      .on("start", () => {
        svg.select("#geoviztooltip").style("visibility", "hidden");
      })
      .on("zoom", zoom)
  );
  svg.on("click", reset);
}
