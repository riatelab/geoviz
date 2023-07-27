export function columns(x) {
  let arr = [];
  x.forEach((d) => arr.push(Object.keys(d)));
  return [...new Set(arr.flat())];
}
