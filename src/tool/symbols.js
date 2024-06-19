import { picto } from "../helpers/picto";
import { create } from "d3-selection";
const d3 = Object.assign({}, { create });

/**
 * @function tool/symbols
 * @description Display symbols available in geoviz
 * @see {@link https://observablehq.com/@neocartocnrs/symbols }
 * @property {number} [options.width = 800] - width
 * @example
 * geoviz.tool.symbols({ width: 500 })
 */

export function symbols({ width = 800 } = {}) {
  const wspacing = 60;
  const hspacing = 40;
  const init = 20;
  const nb = Math.ceil((width - init * 2) / wspacing);
  const height = Math.ceil(picto.length / nb) * hspacing + init / 2;

  //return nb
  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  let ii = 0;
  let line = 1;

  picto.forEach((d, i) => {
    svg
      .append("path")
      .attr("fill", "#38896F")
      .attr("d", d.d)
      .attr(
        "transform",
        `translate(${init + ii * wspacing}, ${line * hspacing - 20}) scale(1)`
      );

    svg
      .append("text")
      .attr("x", init + ii * wspacing)
      .attr("y", line * hspacing - 5)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "hanging")
      .attr("font-size", 11)
      .attr("fill", "#38896F")
      .text(d.name);

    if (ii >= nb - 1) {
      line += 1;
      ii = 0;
    } else {
      ii += 1;
    }
  });

  return svg.node();
}
