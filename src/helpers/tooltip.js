import { select, pointers } from "d3-selection";
const d3 = Object.assign({}, { select, pointers });

/**
 * @name tip
 * @description The `tip` parameter allows to add tooltips on map layers
 * @see {@link https://observablehq.com/@neocartocnrs/tooltip}
 * @property {string | boolean | function} tip - You can display a simple text like "foo". But in most cases, tooltips are used to display information related to the elements hovered over. To do this, use the `$` prefix with the field name.With `true`, all fidls are displayed. Finally, you can pass a function to build a customized tooltip.
 * @property {object} tipstyle - An object to configure the "appearance of the tooltip. `fontSize`, `fill`, `background`, `stroke`,  `strokeWidth`, `fontFamily`, `fontWeight`, `fontStyle`, `textDecoration`. See also `tool.addonts`
 
 * @example
 * // Simple text
 * viz.path({ data: world, tip: "hello" })
 * @example
 * // A field to display
 * viz.path({ data: world, tip: "$pop" })
 * @example
 * // To display all fields
 * viz.path({ data: world, tip: true })
  * @example
 * // A tooltip on several lines
 * viz.path({
  data: world,
  fill: "#38896F",
  tip: `This country is $name
  It is located in $region
  Its population is $pop` 
  })
 * @example
 * // A function
 * viz.path({
  data: world,
  fill: "#38896F",
  tip: (d) =>
    `There are ${Math.round(
      d.properties.pop / 1000000
    )} million inhabitants in ${d.properties.name}`
  })
* @example
* // Custom style
* viz.path({
  data: world,
  fill: "#CCC",
  tip: `$name ($ISO3)`,
  tipstyle: {
    fontSize: 20,
    fill: "white",
    background: "#38896F",
    stroke: "#4a4d4b",
    strokeWidth: 3,
    fontFamily: "Pacifico",
    fontWeight: "normal",
    fontStyle: "italic",
    textDecoration: "none"
  }
})
 */

export function tooltip(
  layer,
  data,
  container,
  tip,
  tip_style = {},
  fields,
  view
) {
  // view
  let dataview;

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

  let context = container.node();

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
  layer
    .selectAll("*")
    .on("touchmove mousemove", function (event, d) {
      // view
      if (view) {
        dataview = d.properties;
        container.dispatch("input");
      }

      geoviztooltip.style("visibility", "visible");
      const xy = d3.pointers(event, context)[0];
      d3.select(this).attr("fill-opacity", 0.5);
      text
        .selectAll("text")
        .data(eval(tip.toString().split("=>")[1]).split("\n"))
        .join("text")
        .attr("dy", (d, i) => i * style.fontSize)
        .text((d) => d);
      path.attr("transform", `translate(${xy})`);
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
      d3.select(this).attr("fill-opacity", formerOpacity);
      geoviztooltip.style("visibility", "hidden");
      if (view) {
        dataview = {};
        container.dispatch("input");
      }
    });

  if (view) {
    Object.defineProperty(container.node(), "value", {
      get: () => dataview,
    });
  }
}
