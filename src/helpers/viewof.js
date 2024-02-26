import { select, pointers } from "d3-selection";
const d3 = Object.assign({}, { select, pointers });

export function viewof(layer, container) {
  let formerOpacity = layer.attr("fill-opacity");
  let data;
  layer
    .selectAll("*")
    .on("touchmove mousemove", function (event, d) {
      d3.select(this).attr("fill-opacity", 0.5);
      data = d.properties;
      container.dispatch("input");
    })
    .on("touchend mouseleave", function (event, d) {
      d3.select(this).attr("fill-opacity", formerOpacity);
      data = {};
      container.dispatch("input");
    });

  Object.defineProperty(container.node(), "value", {
    get: () => data,
  });
}
