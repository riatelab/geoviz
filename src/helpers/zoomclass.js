export function zoomclass(inset, projection) {
  let zclass = "nozoom";
  if (projection != "none" && !inset) {
    zclass = "zoomable";
  }
  if (projection == "none" && !inset) {
    zclass = "zoomable2";
  }
  return zclass;
}
