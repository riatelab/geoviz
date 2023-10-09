import { getDOMids } from "../helpers/getDOMids";
import { zoom, zoomTransform, zoomIdentity, ZoomTransform } from "d3-zoom";
import { geoPath, geoIdentity } from "d3-geo";
const d3 = Object.assign(
  {},
  { zoom, geoPath, geoIdentity, zoomTransform, zoomIdentity, ZoomTransform }
);

/**
 * The `render` function returns the svg document
 *
 * @param {SVGSVGElement} svg - SVG container to display. This can be generated using the `container.init` function.
 * @param {object} options - options and parameters
 * @param {object[]} options.order - array determining the order of layers. This option is only useful in Observable (because of its topological nature). 
 * @example
 * geoviz.container.render(svg, {order: [basemap, roads, cities]})
 * @returns {SVGSVGElement} - a pretty map in SVG format :-)

 */
export function render(svg, { order = [] } = {}) {
  // Reorder layers
  if (order.length > 0) {
    if (getDOMids(svg).toString() !== order) {
      order.forEach((d) => {
        svg.select(`${d}`).raise();
      });
    }
  }

  // Zoom
  let noproj = d3.geoIdentity();
  if (svg.zoomable) {
    const baseScale = svg.projection.scale();
    const baseTranslate = svg.projection.translate();

    function zoom({ transform }) {
      // Adapt projection
      svg.projection
        .scale(transform.k * baseScale)
        .translate([
          baseTranslate[0] * transform.k + transform.x,
          baseTranslate[1] * transform.k + transform.y,
        ]);
      noproj.scale(transform.k).translate([transform.x, transform.y]);

      render(transform);
    }

    function reset() {
      d3.zoomTransform(this).k = 1;
      d3.zoomTransform(this).x = 0;
      d3.zoomTransform(this).y = 0;
      svg.projection.scale(baseScale).translate(baseTranslate);
      noproj.scale(1).translate([0, 0]);
      render({ k: 1, x: 0, y: 0 });
    }

    function render(t) {
      // Path
      const path = d3.geoPath(svg.projection);
      svg.selectAll(".zoomable > path").attr("d", path);
      const path2 = d3.geoPath(noproj);
      svg.selectAll(".zoomable2 > path").attr("d", path2);

      // Circles
      svg
        .selectAll(".zoomable > circle")
        .attr("cx", (d) => svg.projection(d.geometry.coordinates)[0])
        .attr("cy", (d) => svg.projection(d.geometry.coordinates)[1]);
      svg
        .selectAll(".zoomable2 > circle")
        .attr("cx", (d) => noproj(d.geometry.coordinates)[0])
        .attr("cy", (d) => noproj(d.geometry.coordinates)[1]);

      // Texts
      svg
        .selectAll(".zoomable > text")
        .attr("x", (d) => svg.projection(d.geometry.coordinates)[0])
        .attr("y", (d) => svg.projection(d.geometry.coordinates)[1]);
      svg
        .selectAll(".zoomable2 > text")
        .attr("x", (d) => noproj(d.geometry.coordinates)[0])
        .attr("y", (d) => noproj(d.geometry.coordinates)[1]);

      // Tiles
      svg.selectAll(".zoomable > image").attr("transform", t);
    }

    svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [svg.width, svg.height],
        ])
        .scaleExtent([1, 8])
        .on("start", () => {
          svg.select("#geoviztooltip").style("visibility", "hidden");
        })
        .on("zoom", zoom)
    );
    svg.on("click", reset);
  }

  // raise tooltips
  svg.select("#geoviztooltip").raise();
  // Add metadata
  Object.assign(svg.node(), {
    metadata: "Map designed with https://github.com/neocarto/geoviz",
  });
  // render
  return svg.node();
}
