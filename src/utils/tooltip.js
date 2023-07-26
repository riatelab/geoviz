import { select, pointers } from "d3-selection";
const d3 = Object.assign({}, { select, pointers });

export function tooltip({ container, layer = null, text }) {
  container
    .select(`#${layer}`)
    .selectAll("path")
    .on("touchmove mousemove", function (event, d) {
      d3.select(this).attr("fill-opacity", 0.5);
      container
        .select("#_geoviztooltip")
        .attr("opacity", 1)
        .text(eval(text.toString().split("=>")[1]))
        .attr("transform", `translate(${d3.pointers(event, this)[0]})`)
        .attr("dy", -30);
    })
    .on("touchend mouseleave", function () {
      d3.select(this).attr("fill-opacity", 1);
    });
}
