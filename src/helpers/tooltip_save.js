import { select, pointers } from "d3-selection";
const d3 = Object.assign({}, { select, pointers });

export function tooltip(layer, container, tip, tip_style = {}) {
  let style = {
    fontSize: 15,
    fill: "#4d4545",
    background: "#fcf7e6",
    stroke: "#4a4d4b",
    strokeWidth: 1,
    fontFamily: "Roboto",
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
  };

  if (container.selectAll("#_geoviztooltip").empty()) {
    console.log("create");
    container.append("g").attr("id", "_geoviztooltip");
  } else {
    console.log("not create");
  }

  Object.keys(tip_style).forEach((d) => {
    style[d] = tip_style[d];
  });

  //layer.style("visiblility", "hidden");
  const geoviztooltip = container.select("#_geoviztooltip");
  geoviztooltip.attr("pointer-events", "none");

  const path = geoviztooltip
    .append("g")
    .attr("fill", style.background)
    .attr("stroke", style.stroke)
    .attr("stroke-width", style.strokeWidth)
    .selectAll("path")
    .data([null])
    .join("path");
  const text = geoviztooltip
    .append("g")
    .attr("font-size", `${style.fontSize}px`)
    .attr("fill", style.fill)
    .attr("font-family", style.fontFamily)
    .attr("font-weight", style.fontWeight)
    .attr("font-style", style.fontStyle)
    .attr("text-decoration", style.textDecoration);

  layer
    .selectAll("*")
    .on("touchmove mousemove", function (event, d) {
      geoviztooltip.style("visibility", "visible");
      const xy = d3.pointers(event, this)[0];
      d3.select(this).attr("fill-opacity", 0.5);
      text
        .selectAll("text")
        .data(eval(tip.toString().split("=>")[1]).split("\n"))
        .join("text")
        .attr("dy", (d, i) => i * style.fontSize)
        .text((d) => d);
      path.attr("transform", `translate(${d3.pointers(event, this)[0]})`);
      const { x, y, width: w, height: h } = text.node().getBBox();

      const x_margin = 0.33 * container.width;
      const y_margin = 0.25 * container.height;

      // bottomright
      if (xy[0] < x_margin && xy[1] < y_margin) {
        text.attr("transform", `translate(${xy[0] + 10},${xy[1] + 15 - y})`);
        path.attr("d", `M0,0v${+h + 5 + 20}h${w + 20}v${-h - 20}h${-w - 15}z`);
      }

      // bottomleft
      else if (xy[0] > container.width - x_margin && xy[1] < y_margin) {
        text.attr(
          "transform",
          `translate(${xy[0] - w - 10},${xy[1] + 15 - y})`
        );
        path.attr("d", `M0,0v${+h + 5 + 20}h${-w - 20}v${-h - 20}h${+w + 15}z`);
      }

      // topright
      else if (xy[0] < x_margin && xy[1] > container.height - y_margin) {
        text.attr(
          "transform",
          `translate(${xy[0] + 10},${xy[1] - 15 - y - h})`
        );
        path.attr("d", `M0,0v${-h - 5 - 20}h${w + 20}v${h + 20}h${-w - 15}z`);
      }
      //topleft
      else if (
        xy[0] > container.width - x_margin &&
        xy[1] > container.height - y_margin
      ) {
        text.attr(
          "transform",
          `translate(${xy[0] - w - 10},${xy[1] - 15 - y - h})`
        );
        path.attr("d", `M0,0v${-h - 5 - 20}h${-w - 20}v${h + 20}h${w + 15}z`);
      }
      // top
      else if (xy[1] > container.height - y_margin) {
        text.attr(
          "transform",
          `translate(${xy[0] - w / 2},${xy[1] - 15 - y - h})`
        );
        path.attr(
          "d",
          `M${-w / 2 - 10},-5H-5l5,5l5,-5H${w / 2 + 10}v${-h - 20}h-${w + 20}z`
        );
      }

      // right
      else if (xy[0] < x_margin) {
        text.attr("transform", `translate(${xy[0] + 15},${xy[1] - y - h / 2})`);
        path.attr(
          "d",
          `M0,0l5,5v${h / 2 + 5}h${w + 20}v${-h - 20}h${-w - 20}v${h / 2 + 5}z`
        );
      }
      // left
      else if (xy[0] > container.width - x_margin) {
        text.attr(
          "transform",
          `translate(${xy[0] - w - 15},${xy[1] - y - h / 2})`
        );
        path.attr(
          "d",
          `M0,0l-5,5v${h / 2 + 5}h${-w - 20}v${-h - 20}h${w + 20}v${h / 2 + 5}z`
        );
      } else {
        // Bottom
        text.attr("transform", `translate(${xy[0] - w / 2},${xy[1] - y + 15})`);
        path.attr(
          "d",
          `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`
        );
      }
    })
    .on("touchend mouseleave", function (event, d) {
      d3.select(this).attr("fill-opacity", 1);
      geoviztooltip.style("visibility", "hidden");
    });
}
