export function propertiesentries(x) {
  let arr = [];
  x.features.map((d) => d.properties).forEach((d) => arr.push(Object.keys(d)));
  return [...new Set(arr.flat())];
}
