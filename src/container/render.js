/**
 * The `render` function returns the svg document
 *
 * @param {} - svg
 * @returns {SVGSVGElement} - A pretty map in SVG format :-)

 */
export function render(svg, { order = [] } = {}) {
  order.forEach((d) => {
    svg.select(`${d}`).raise();
  });

  // raise tooltips
  svg.select("#_geoviztooltip").raise();
  // Add metadata
  Object.assign(svg.node(), {
    metadata: "Map designed with https://github.com/neocarto/geoviz",
  });
  // render
  return svg.node();
}
