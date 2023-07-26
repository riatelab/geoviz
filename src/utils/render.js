export function render(svg) {
  // raise tooltips and legends
  svg.selectAll(".legend").raise();
  svg.select("#_geoviztooltip").raise();
  // Add metadat
  Object.assign(svg.node(), {
    metadata: "Map designed with https://github.com/neocarto/geoviz",
  });
  // render
  return svg.node();
}
