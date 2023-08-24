export function render(svg, { order = [] } = {}) {
  order.forEach((d) => {
    svg.select(`#${d}`).raise();
  });

  // raise tooltips and legends
  svg.selectAll(".legend").raise();
  svg.select("#_geoviztooltip").raise();
  // Add metadata
  Object.assign(svg.node(), {
    metadata: "Map designed with https://github.com/neocarto/geoviz",
  });
  // render
  return svg.node();
}
