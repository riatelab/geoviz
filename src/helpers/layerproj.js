export function layerproj(svgproj, x) {
  if (x) {
    if (x == "none") {
      return (d) => d;
    } else return x;
  } else {
    return svgproj;
  }
}
