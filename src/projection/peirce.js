import { geoPeirceQuincuncial } from "d3-geo-projection";
const d3 = Object.assign({}, { geoPeirceQuincuncial });

// Peirce quincuncial projection

export function Peirce() {
  const projection = d3.geoPeirceQuincuncial().rotate([-25, -90]);
  return projection;
}
