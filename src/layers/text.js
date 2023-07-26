export function text({
  container,
  text = "My text here",
  pos = [10, 10],
  id = null,
  fill = "#e87daf",
  stroke = "none",
  fontSize = 15,
  fontFamily = "Roboto",
  margin = 0,
  fontWeight = "normal",
  fontStyle = "normal",
  textDecoration = "none",
  textAnchor = "start",
  dominantBaseline = "hanging",
  fillOpacity = 1,
}) {
  let txt = text.split("\n");

  container
    .append("g")
    .attr("id", id)
    .selectAll("text")
    .data(txt)
    .join("text")
    // .attr("x", x + margin_x)
    // .attr("y", y - +delta + margin_y)
    .attr("x", pos[0])
    .attr("y", pos[1])
    .attr("font-size", `${fontSize}px`)
    .attr("font-style", fontStyle)
    .attr("text-decoration", textDecoration)
    .attr("font-weight", fontWeight)
    .attr("font-family", fontFamily)
    .attr("dy", (d, i) => i * fontSize)
    .attr("text-anchor", textAnchor)
    .attr("dominant-baseline", dominantBaseline)
    .attr("fill", fill)
    .attr("stroke", stroke)
    .text((d) => d);
}
