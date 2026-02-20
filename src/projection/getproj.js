import { stringtod3proj } from "./stringtod3proj";
import { Polar } from "./polar";
import { HoaXiaoguang } from "./hoaxiaoguang";
import { Spilhaus } from "./spilhaus";
import { Peirce } from "./peirce";

export function getproj(projection) {
  /* DEFAULT - the projection is not defined.
   */

  if (
    projection === null ||
    projection === undefined ||
    projection === "" ||
    projection === "none"
  ) {
    return "none";
  } else if (typeof projection === "function") {
    /* FUNCTION - if the projection is a d3.js.
    then, the function is used directly.*/
    return projection;
  }

  //   STRINGS
  else if (typeof projection === "string" && projection !== "none") {
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
    if (projection.toLowerCase() == "peirce") {
      return Peirce();
    }

    return stringtod3proj(projection);
  }
}
