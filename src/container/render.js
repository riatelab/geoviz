import { getDOMids } from "../helpers/getDOMids";
// import { zoom } from "d3-zoom";
// const d3 = Object.assign({}, { zoom });

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
  if (svg.zoomable) {
    function zoomed(event) {
      const { transform } = event;
      svg.selectAll(".zoomable").attr("transform", transform);
      svg
        .select("#geoviztooltip")
        .attr("transform", { x: transform.x, y: transform.y });
    }
    svg.call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed));
  }

  // raise tooltips
  svg.select("#geoviztooltip").raise();
  // svg.select(".geotooltip").raise();
  // const geoviztooltip = container.select(`#geoviztooltip`);
  // Add metadata
  Object.assign(svg.node(), {
    metadata: "Map designed with https://github.com/neocarto/geoviz",
  });
  // render
  return svg.node();
}
