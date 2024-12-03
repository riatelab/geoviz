import { geoEquirectangular } from "d3-geo";
const d3 = Object.assign({}, { geoEquirectangular });

export function getproj(projection) {
  /* DEFAULT - the projection is not defined.
    The default projection is d3.geoEquirectangular().
   */

  if (projection === null || projection === undefined || projection === "") {
    return d3.geoEquirectangular();
  }

  /* FUNCTION - if the projection is a d3.js function (outside bertin.js).
    then, the function is used directly.*/

  if (typeof projection === "function") {
    return projection;
  }

  //   STRINGS
  if (typeof projection === "string") {
    projection = projection.replace(/\s/g, "");

    /* CUSTOM projections*/

    if (projection.toLowerCase() == "polar") {
      return Polar();
    }
    if (projection.toLowerCase() == "hoaxiaoguang") {
      return HoaXiaoguang();
    }
    if (projection.toLowerCase() == "spilhaus") {
      return Spilhaus();
    }

    return stringtod3proj(projection);
  }
}
