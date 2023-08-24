import { addattr } from "../helpers/addattr";

export function text(
  svg,
  {
    text = "My text here",
    pos = [10, 10],
    id = null,
    fill = "#e87daf",
    fontSize = 15,
  } = {}
) {
  // remove
  let layer = svg.select(`g.${id}`).empty()
    ? svg.append("g")
    : svg.select(`g.${id}`);

  layer.attr("id", id).attr("font-size", `${fontSize}px`).attr("fill", fill);

  // let layer = svg
  //   .append("g")
  //   .attr("id", id)
  //   .attr("font-size", `${fontSize}px`)
  //   .attr("fill", fill);

  // ...styles
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

  return id ? `#${id}` : "text layer";
}
