import { getDOMids } from "../helpers/getDOMids";
import { zoomandpan } from "../helpers/zoomandpan";
import { zoomversor } from "../helpers/zoomversor";
import { select, pointers } from "d3-selection";
const d3 = Object.assign({}, { select, pointers });
//import { warning } from "../helpers/warning";

/**
 * @function render
 * @description The `render` function returns the svg document. It returns a pretty map in SVG format :-)
 * @see {@link https://observablehq.com/@neocartocnrs/geoviz}
 *
 * @property {SVGSVGElement} svg - SVG container to display. This can be generated using the `create` function.
 * @property {object[]} [order] - array determining the order of layers. This option is only useful in Observable notebooks (because of its topological nature).
 * @example
 * geoviz.render(svg, {order: [basemap, roads, cities]}) // where svg is the container
 * svg.render({order: [basemap, roads, cities]}) // where svg is the container
 */
export function render(svg, { order = [] } = {}) {
  // Adjust extent // TODO
  // const size = getsize(svg);
  // svg
  //   .attr("width", size.width)
  //   .attr("height", size.height)
  //   .attr("viewBox", [size.x, size.y, size.width, size.height]);

  // Reorder layers
  if (order.length > 0) {
    order = order.flat();
    if (getDOMids(svg).toString() !== order) {
      order.forEach((d) => {
        svg.select(`${d}`).raise();
      });
    }
  }

  // Warning
  if (svg.data && svg.initproj == "none" && !svg.domain && svg.warning) {
    svg.warning_message.push(
      `You must specify a projection and/or the domain in the SVG container`
    );
  }

  if (svg.zoomable == "versor" && svg.initproj == "none" && svg.warning) {
    svg.warning_message.push(
      `You must specify a projection tu use versor zooming`
    );
  }

  if (svg.warning && svg.warning_message.length > 0) {
    let style = {
      fontSize: 13,
      fill: "#594A2F",
      background: "#FDD66C",
      stroke: "#FDD66C",
      strokeWidth: 1,
    };

    let warningtooltip = svg
      .append("g")
      .attr("id", "warningtooltip")
      .attr("pointer-events", "none")
      .style("visibility", "hidden")
      .attr("transform", `translate(30,10)`);

    const h = svg.warning_message.length * style.fontSize;
    const w = svg.width - 80;

    let warningpath = warningtooltip
      .append("g")
      .attr("fill", style.background)
      .attr("stroke", style.stroke)
      .attr("stroke-width", style.strokeWidth);

    warningpath
      .append("path")
      .attr("d", `M0,0v${+h + 5 + 20}h${w + 20}v${-h - 20}h${-w - 15}z`)
      .attr("transform", "translate(-10,20)");

    let warningtext = warningtooltip
      .append("g")
      .attr("font-size", `${style.fontSize}px`)
      .attr("fill", style.fill)
      .attr("font-family", style.fontFamily)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("transform", `translate(${(svg.width - 70) / 2},${45})`);

    warningtext
      .selectAll("text")
      .data(svg.warning_message)
      .join("text")
      .attr("dy", (d, i) => i * style.fontSize)
      .text((d) => d);

    svg
      .append("g")
      .attr("font-size", `${15}px`)
      .append("text")
      .attr("x", 10)
      .attr("y", 20)
      .text("⚠️")
      .on("touchmove mousemove", function (event, d) {
        d3.select(this).style("cursor", "pointer");
        warningtooltip.style("visibility", "visible");
      })
      .on("touchend mouseleave", function () {
        warningtooltip.style("visibility", "hidden");
        d3.select(this).style("cursor", "default");
      });
  }

  // Zoom
  if (svg.zoomable) {
    if (svg.zoomable == "versor") {
      zoomversor(svg);
    } else {
      zoomandpan(svg);
    }
  }

  if (svg.versor) {
  }

  // raise tooltips & legends
  svg.selectAll(".geovizlegend").raise();
  svg.selectAll("#geoviztooltip").raise();
  svg.selectAll(`#${svg.controlid}`).raise();

  // render
  const dom = svg.node();
  dom.viz = svg;
  return dom;
  //return svg.node();
}
