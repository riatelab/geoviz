export function render(svg) {
  // raise tooltips and legends
  svg.selectAll(".legend").raise();
  svg.selectAll(".info").raise();
  // Add metadat
  Object.assign(svg.node(), {
    metadata: "Map designed with https://github.com/neocarto/geoviz",
  });
  // render
  return svg.node();
}
