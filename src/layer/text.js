import { addattr } from "../helpers/addattr";
import { unique } from "../helpers/unique";

/**
 * Generate a layer with a text
 */
export function text(
  svg,
  {
    text = "My text here",
    pos = [10, 10],
    id = unique(),
    fill = "#e87daf",
    fontSize = 15,
  } = {}
) {
  // init layer
  let layer = svg.selectAll(`#${id}`).empty()
    ? svg.append("g").attr("id", id)
    : svg.select(`#${id}`);
  layer.selectAll("*").remove();

  // Attr with specific default values
  layer.attr("font-size", `${fontSize}px`).attr("fill", fill);

  // ...attr
  addattr({
    layer,
    args: arguments[1],
    exclude: ["fontSize", "fill"],
  });

  layer
    .selectAll("text")
    .data(text.split("\n"))
    .join("text")
    .attr("x", pos[0])
    .attr("y", pos[1])
    .attr("dy", (d, i) => i * fontSize)
    .text((d) => d);

  return `#${id}`;
}
