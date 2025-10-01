import { create } from "./create";
import { tile } from "../mark/tile";
import { implantation, detectinput } from "../helpers/utils";
import { featurecollection } from "../tool/featurecollection";
import { whatisit } from "../helpers/whatisit";
import { simplify } from "geotoolbox";

/**
 * @function view
 * @description The `view()` function allows you to quickly display one or more layers with an OpenStreetMap background.
 * @property {object|Array} data - a geoJSON or an array of geoJSONs (or possibly geometries or arrays of features)
 * @property {number} [options.width = 500] - Map width
 * @property {number|array} [options.margin = 10] - Map margins
 * @property {array} [options.colors = []] - An array containing colors if the default colors do not suit you
 * @property {function|string} [options.projection = "mercator"] - Map projection
 * @property {boolean} [options.tiles = true] - To display an OSM raster layer
 * @property {boolean} [options.tip = true] - To enable hovering over elements with the mouse
 * @property {boolean} [options.zoomable = true] - To enable pan and zoom
 * @example
 * geoviz.view(*a geoJSON*)
 * geoviz.view([*a geoJSON*,* another geoJSON*])
 * geoviz.view(*a geoJSON*, {projection:"Polar", width:1000})
 */
export function view(
  arr,
  {
    width = 500,
    colors = [],
    k = undefined,
    projection = "mercator",
    tiles = true,
    tip = false,
    zoomable = true,
    margin = 10,
  } = {}
) {
  if (!arr) {
    return tile();
  } else {
    if (
      [
        "FeatureCollection",
        "features",
        "feature",
        "geometries",
        "geometry",
      ].includes(whatisit(arr))
    ) {
      arr = [arr];
    }

    arr = arr.map((d) => simplify(featurecollection(d), { k }));
    const cols = [
      "#d62728",
      "#1f77b4",
      "#2ca02c",
      "#ff7f0e",
      "#9467bd",
      "#8c564b",
      "#e377c2",
      "#7f7f7f",
      "#bcbd22",
      "#17becf",
      "#393b79",
      "#637939",
      "#8c6d31",
      "#843c39",
      "#7b4173",
      "#5254a3",
      "#9c9ede",
      "#6b6ecf",
      "#9c9ede",
      "#637939",
    ];
    let svg = create({
      domain: arr,
      zoomable,
      width,
      margin,
      projection,
    });

    if (projection == "mercator") {
      if (tiles == true) {
        svg.tile();
      }
    }

    arr.forEach((d, i) => {
      const imp = implantation(d);
      svg.path({
        data: d,
        fill: imp == 2 ? "none" : colors[i] || cols[i],
        stroke: colors[i] || cols[i],
        strokeWidth: imp == 2 ? 1.5 : 1,
        fillOpacity: 0.6,
        tip,
      });
    });

    return svg.render();
  }
}
