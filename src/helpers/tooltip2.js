import { transform2obj } from "./utils";
import { select, pointers } from "d3-selection";
const d3 = Object.assign({}, { select, pointers });

export function tooltip(layer, data, container, tip, tip_style = {}, fields) {
  //if input == string
  if (typeof tip === "string") {
    const sortfields = fields.sort((a, b) => b.length - a.length);
    fields.forEach((d) => {
      tip = tip.replace(`$${d}`, `\${d.properties.${d}}`);
    });
    tip = eval("d => `" + tip + "`");
  }

  // if function
  else if (typeof tip == "function") {
    const arrstr = tip.toString().split("=>");
    if (!arrstr[1].includes("`${")) {
      tip = eval(arrstr[0] + " => `${" + tip.toString().split("=>")[1] + "}`");
    }
  }

  //if input == true
  else if (tip === true) {
    let x = { ...data };
    let keys = [];
    x.features
      .map((d) => d.properties)
      .forEach((d) => {
        keys.push(Object.keys(d));
      });
    keys = Array.from(new Set(keys.flat()));

    let str = [];
    keys.forEach((d) => str.push(`${d}: \${d.properties.${d}}`));
    tip = eval("(d) => `" + str.join("\n") + "`");
  }

  // style
  let style = {
    fontSize: 13,
    fill: "#4d4545",
    background: "#fcf7e6",
    stroke: "#4a4d4b",
    strokeWidth: 1,
    fontFamily: container.fontFamily,
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    hoverOpacity: 0.5,
    hoverFill: undefined,
    hoverStroke: undefined,
  };

  let formerOpacity = layer.attr("fill-opacity");

  Object.keys(tip_style).forEach((d) => {
    style[d] = tip_style[d];
  });

  const geoviztooltip = container.select(`#geoviztooltip`);
  geoviztooltip.attr("pointer-events", "none");

  let path;
  let text;
  if (container.select(`#geoviztooltip`).selectAll("*").empty()) {
    path = geoviztooltip
      .append("g")
      .attr("id", "geotooltippath")
      .attr("fill", style.background)
      .attr("stroke", style.stroke)
      .attr("stroke-width", style.strokeWidth)
      .selectAll("path")
      .data([null])
      .join("path");
    text = geoviztooltip
      .append("g")
      .attr("id", "geotooltiptext")
      .attr("font-size", `${style.fontSize}px`)
      .attr("fill", style.fill)
      .attr("font-family", style.fontFamily)
      .attr("font-weight", style.fontWeight)
      .attr("font-style", style.fontStyle)
      .attr("text-decoration", style.textDecoration);
  } else {
    path = geoviztooltip
      .select("#geotooltippath")
      .attr("fill", style.background)
      .attr("stroke", style.stroke)
      .attr("stroke-width", style.strokeWidth)
      .selectAll("path")
      .data([null])
      .join("path");
    text = geoviztooltip.select("#geotooltiptext");
  }

  let translate = transform2obj(layer.attr("transform"))?.translate;
  layer
    .selectAll("*")
    .on("touchmove mousemove", function (event, d) {
      geoviztooltip.style("visibility", "visible");
      const xy = d3.pointers(event, this)[0];
      d3.select(this).attr("fill-opacity", 0.5);

      if (!translate) {
        translate = transform2obj(d3.select(this).attr("transform"))?.translate;
      }

      translate = translate ? translate : [0, 0];

      const pos = d3.pointers(event, this)[0];
      const posx = pos[0] + translate[0];
      const posy = pos[1] + translate[1];
      text
        .selectAll("text")
        .data(eval(tip.toString().split("=>")[1]).split("\n"))
        .join("text")
        .attr("dy", (d, i) => i * style.fontSize)
        .text((d) => d);

      path.attr("transform", `translate(${[posx, posy]})`);
      const { x, y, width: w, height: h } = text.node().getBBox();

      const x_margin = 0.33 * container.width;
      const y_margin = 0.25 * container.height;

      // bottomright
      if (posx < x_margin && posy < y_margin) {
        text.attr("transform", `translate(${posx + 10},${posy + 15 - y})`);
        path.attr("d", `M0,0v${+h + 5 + 20}h${w + 20}v${-h - 20}h${-w - 15}z`);
      }

      // bottomleft
      else if (posx > container.width - x_margin && posy < y_margin) {
        text.attr("transform", `translate(${posx - w - 10},${posy + 15 - y})`);
        path.attr("d", `M0,0v${+h + 5 + 20}h${-w - 20}v${-h - 20}h${+w + 15}z`);
      }

      // topright
      else if (posx < x_margin && posy > container.height - y_margin) {
        text.attr("transform", `translate(${posx + 10},${posy - 15 - y - h})`);
        path.attr("d", `M0,0v${-h - 5 - 20}h${w + 20}v${h + 20}h${-w - 15}z`);
      }
      //topleft
      else if (
        posx > container.width - x_margin &&
        posy > container.height - y_margin
      ) {
        text.attr(
          "transform",
          `translate(${posx - w - 10},${posy - 15 - y - h})`
        );
        path.attr("d", `M0,0v${-h - 5 - 20}h${-w - 20}v${h + 20}h${w + 15}z`);
      }
      // top
      else if (posy > container.height - y_margin) {
        text.attr(
          "transform",
          `translate(${posx - w / 2},${posy - 15 - y - h})`
        );
        path.attr(
          "d",
          `M${-w / 2 - 10},-5H-5l5,5l5,-5H${w / 2 + 10}v${-h - 20}h-${w + 20}z`
        );
      }

      // right
      else if (posx < x_margin) {
        text.attr("transform", `translate(${posx + 15},${posy - y - h / 2})`);
        path.attr(
          "d",
          `M0,0l5,5v${h / 2 + 5}h${w + 20}v${-h - 20}h${-w - 20}v${h / 2 + 5}z`
        );
      }
      // left
      else if (posx > container.width - x_margin) {
        text.attr(
          "transform",
          `translate(${posx - w - 15},${posy - y - h / 2})`
        );
        path.attr(
          "d",
          `M0,0l-5,5v${h / 2 + 5}h${-w - 20}v${-h - 20}h${w + 20}v${h / 2 + 5}z`
        );
      } else {
        // Bottom
        text.attr("transform", `translate(${posx - w / 2},${posy - y + 15})`);
        path.attr(
          "d",
          `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`
        );
      }
    })
    .on("touchend mouseleave", function (event, d) {
      d3.select(this).attr("fill-opacity", formerOpacity);
      geoviztooltip.style("visibility", "hidden");
    });
}
