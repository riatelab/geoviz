import { create } from "d3-selection";
const d3 = Object.assign({}, { create });
export function getsize(elt) {
  const clonetxt = elt.clone(true);
  const svg = d3.create("svg");
  svg.node().appendChild(clonetxt.node());
  document.body.appendChild(svg.node());
  const { x, y, width, height } = clonetxt.node().getBBox();
  document.body.removeChild(svg.node());
  let dims = { x, y, width, height };
  return dims;
}
