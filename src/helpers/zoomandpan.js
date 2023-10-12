import { zoom, zoomTransform } from "d3-zoom";
import { geoPath, geoIdentity } from "d3-geo";
import { tile } from "d3-tile";
const d3 = Object.assign(
  {},
  {
    zoom,
    geoPath,
    geoIdentity,
    zoomTransform,
    tile,
  }
);

export function zoomandpan(svg) {
  function zoom({ transform }) {
    // Adapt projection
    svg.projection
      .scale(transform.k * svg.baseScale)
      .translate([
        svg.baseTranslate[0] * transform.k + transform.x,
        svg.baseTranslate[1] * transform.k + transform.y,
      ]);
    d3.geoIdentity().scale(transform.k).translate([transform.x, transform.y]);

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
    const path2 = d3.geoPath(d3.geoIdentity());
    svg.selectAll(".zoomable2 > path").attr("d", path2);

    // Outline
    svg
      .selectAll(".zoomableoutline > path")
      .attr("d", d3.geoPath(svg.projection)({ type: "Sphere" }));

    // Circles
    svg
      .selectAll(".zoomable > circle")
      .attr("cx", (d) => d3.geoPath(svg.projection).centroid(d.geometry)[0])
      .attr("cy", (d) => d3.geoPath(svg.projection).centroid(d.geometry)[1]);
    svg
      .selectAll(".zoomable2 > circle")
      .attr("cx", (d) => d3.geoIdentity()(d.geometry.coordinates)[0])
      .attr("cy", (d) => d3.geoIdentity()(d.geometry.coordinates)[1]);

    // Texts
    svg
      .selectAll(".zoomable > text")
      .attr("cx", (d) => d3.geoPath(svg.projection).centroid(d.geometry)[0])
      .attr("cy", (d) => d3.geoPath(svg.projection).centroid(d.geometry)[1]);
    svg
      .selectAll(".zoomable2 > text")
      .attr("x", (d) => d3.geoIdentity()(d.geometry.coordinates)[0])
      .attr("y", (d) => d3.geoIdentity()(d.geometry.coordinates)[1]);

    // Tiles

    if (!svg.selectAll(".zoomabletiles").empty()) {
      const datalayer = JSON.parse(
        svg.selectAll(".zoomabletiles").attr("data-layer")
      );

      let tile = d3
        .tile()
        .size([svg.width, svg.height])
        .scale(svg.projection.scale() * 2 * Math.PI)
        .translate(svg.projection([0, 0]))
        .tileSize(datalayer.tileSize)
        .zoomDelta(datalayer.zoomDelta);

      let url = eval(datalayer.url);
      svg
        .select(".zoomabletiles")
        .selectAll("image")
        .data(tile(), (d) => d)
        .join("image")
        .attr("xlink:href", (d) => url(...d))
        .attr("x", ([x]) => (x + tile().translate[0]) * tile().scale)
        .attr("y", ([, y]) => (y + tile().translate[1]) * tile().scale)
        .attr("width", tile().scale + datalayer.increasetilesize + "px")
        .attr("height", tile().scale + datalayer.increasetilesize + "px");
    }
  }

  svg.call(
    d3
      .zoom()
      .extent([
        [0, 0],
        [svg.width, svg.height],
      ])
      .scaleExtent([1, typeof svg.zoomable == "number" ? svg.zoomable : 8])
      .on("start", () => {
        svg.select("#geoviztooltip").style("visibility", "hidden");
      })
      .on("zoom", zoom)
  );
  svg.on("click", reset);
}
