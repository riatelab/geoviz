export function getDOMids(svg) {
  let g = svg.selectAll("g");
  let nb = g._groups[0].length;
  let arr = [];
  for (let i = 0; i < nb; i++) {
    arr.push(g.selectAll("id")._parents[i].id);
  }
  return arr.filter((d) => d !== "");
}
