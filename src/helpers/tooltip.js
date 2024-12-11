import { select, pointers } from "d3-selection";
import { camelcasetodash } from "./utils";
const d3 = Object.assign({}, { select, pointers });

/**
 * @name tip
 * @description The `tip` parameter allows to add tooltips on map layers
 * @see {@link https://observablehq.com/@neocartocnrs/tooltip}
 * @property {string | boolean | function} tip - You can display a simple text like "foo".<br/><br/>But in most cases, tooltips are used to display information related to the elements hovered over. To do this, use the `$` prefix with the field name.<br/><br/>With `true`, all fields are displayed.<br/><br/>Finally, you can pass a function to build a customized tooltip.
 * @property {object} tipstyle - An object {} to configure the tooltip.<br/><br/>`action:"over"` (défault) displays the tooltip by hovering with the mouse. `action:"click"` displays the tooltip when clicked.<br/><br/>You can also change the apparence oh the tooltip with these parameters: `fontSize`, `fill`, `background`, `stroke`,  `strokeWidth`, `fontFamily`, `fontWeight`, `fontStyle`, `textDecoration`. See also `tool.addonts`.<br/><br/>You can also configure the the appearance of overflown objects width `overOpacity`, `overFill`, `overStroke`, `overStrokeWidth`, `overFillOpacity` and `overStrokeOpacity`.<br/><br/>Finally, `raise` allow to raise objects. 
 
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
    action: "click",
    fontSize: 20,
    fill: "white",
    background: "#38896F",
    stroke: "#4a4d4b",
    strokeWidth: 3,
    fontFamily: "Pacifico",
    fontWeight: "normal",
    fontStyle: "italic",
    textDecoration: "none",
    overFill:"red"
  }
})
 */

export function tooltip(
  layer,
  data,
  container,
  tip,
  tip_style = { action: "over", raise: false },
  fields,
  view
) {
  // view
  let dataview;

  //if input == string
  if (typeof tip === "string") {
    fields.forEach((d) => {
      tip = tip.replace(`$${d}`, `\${d.properties["${d}"]}`);
    });
    console.log(tip);
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
    keys.forEach((d) => str.push(`${[d]}: \${d.properties["${d}"]}`));

    tip = eval("(d) => `" + str.join("\n") + "`");
  }

  // style
  let style = {
    action: "over",
    fontSize: 17,
    fill: "#4d4545",
    background: "#fcf7e6",
    stroke: "#4a4d4b",
    strokeWidth: 1,
    fontFamily: container.fontFamily,
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    overOpacity: 0.5,
    overFill: undefined,
    overStroke: undefined,
    overStrokeWidth: undefined,
    overFillOpacity: undefined,
    overStrokeOpacity: undefined,
  };

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

  // Pointer
  if (style.action == "click") {
    layer.selectAll("*").on("touchmove mousemove", function () {
      d3.select(this).style("cursor", "pointer");
    });
  }

  // Former style values
  let formerOpacity;
  let formerFill;
  let formerStroke;
  let formerStrokeWidth;
  let formerStrokeOpacity;
  let formerFillOpacity;
  layer.selectAll("*").on("mouseenter", function (d) {
    formerFill = d3.select(this).style("fill") || d3.select(this).attr("fill");
    formerStroke =
      d3.select(this).style("stroke") || d3.select(this).attr("stroke");
    formerOpacity =
      d3.select(this).style("opacity") || d3.select(this).attr("opacity");
    formerStrokeWidth =
      d3.select(this).style("stroke-width") ||
      d3.select(this).attr("stroke-width");
    formerFillOpacity =
      d3.select(this).style("fill-opacity") ||
      d3.select(this).attr("fill-opacity");
    formerStrokeOpacity =
      d3.select(this).style("stroke-opacity") ||
      d3.select(this).attr("stroke-opacity");
  });

  layer
    .selectAll("*")
    .on(
      style.action == "click" ? "click" : "touchmove mousemove",
      function (event, d) {
        // Reset style
        layer.selectAll("*").attr("fill-opacity", formerOpacity);

        // view
        if (view) {
          dataview = d.properties;
          container.dispatch("input");
        }

        geoviztooltip.style("visibility", "visible");
        const xy = d3.pointers(event, context)[0];

        [
          "opacity",
          "fill",
          "stroke",
          "strokeWidth",
          "fillOpacity",
          "strokeOpacity",
        ].forEach((d) => {
          if (style["over" + capitalize(d)]) {
            d3.select(this)
              .attr(camelcasetodash(d), style["over" + capitalize(d)])
              .style(camelcasetodash(d), style["over" + capitalize(d)]);
          }
        });
        if (style.raise) {
          d3.select(this).raise();
        }

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
          path.attr(
            "d",
            `M0,0v${+h + 5 + 20}h${w + 20}v${-h - 20}h${-w - 15}z`
          );
        }

        // bottomleft
        else if (xy[0] > container.width - x_margin && xy[1] < y_margin) {
          text.attr(
            "transform",
            `translate(${xy[0] - w - 10},${xy[1] + 15 - y})`
          );
          path.attr(
            "d",
            `M0,0v${+h + 5 + 20}h${-w - 20}v${-h - 20}h${+w + 15}z`
          );
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
            `M${-w / 2 - 10},-5H-5l5,5l5,-5H${w / 2 + 10}v${-h - 20}h-${
              w + 20
            }z`
          );
        }

        // right
        else if (xy[0] < x_margin) {
          text.attr(
            "transform",
            `translate(${xy[0] + 15},${xy[1] - y - h / 2})`
          );
          path.attr(
            "d",
            `M0,0l5,5v${h / 2 + 5}h${w + 20}v${-h - 20}h${-w - 20}v${
              h / 2 + 5
            }z`
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
            `M0,0l-5,5v${h / 2 + 5}h${-w - 20}v${-h - 20}h${w + 20}v${
              h / 2 + 5
            }z`
          );
        } else {
          // Bottom
          text.attr(
            "transform",
            `translate(${xy[0] - w / 2},${xy[1] - y + 15})`
          );
          path.attr(
            "d",
            `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`
          );
        }
      }
    );

  //if (style.action == "over") {
  layer.selectAll("*").on("touchend mouseleave", function () {
    d3.select(this)
      .attr("opacity", formerOpacity)
      .style("opacity", formerOpacity)
      .attr("fill", formerFill)
      .style("fill", formerFill)
      .attr("stroke", formerStroke)
      .style("stroke", formerStroke)
      .attr("stroke-width", formerStrokeWidth)
      .style("stroke-width", formerStrokeWidth)
      .attr("fill-opacity", formerFillOpacity)
      .style("fill-opacity", formerFillOpacity)
      .attr("stroke-opacity", formerStrokeOpacity)
      .style("stroke-opacity", formerStrokeOpacity);
    geoviztooltip.style("visibility", "hidden");
    if (view) {
      dataview = {};
      container.dispatch("input");
    }
  });
  //}

  // Viewof output

  if (view) {
    Object.defineProperty(container.node(), "value", {
      get: () => dataview,
    });
  }
}

function capitalize(s) {
  return String(s[0]).toUpperCase() + String(s).slice(1);
}

function equalToEventTarget() {
  return this == d3.event.target;
}
