import { getsize } from "../helpers/getsize";

export function addbackground({
  node,
  margin = 5,
  fill = "white",
  stroke = "none",
  fillOpacity = 0.8,
  strokeWidth = 1,
} = {}) {
  const size = getsize(node);

  node
    .append("rect")
    .attr("x", size.x - margin)
    .attr("y", size.y - margin)
    .attr("width", size.width + margin * 2)
    .attr("height", size.height + margin * 2)
    .attr("fill", fill)
    .attr("stroke", stroke)
    .attr("fill-opacity", fillOpacity)
    .attr("stroke-width", strokeWidth)
    .lower();
}
