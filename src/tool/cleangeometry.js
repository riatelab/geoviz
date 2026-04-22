import {
  simplify as simpl,
  makevalid as valid,
  smartrewind,
  clipbyrect,
} from "geotoolbox";

/**
 * @function tool/cleangeometry
 * @description Simplify GeoJSON with optional validity and rewind
 * @property {GeoJSON} data FeatureCollection
 * @property {Object} options
 * @property {number|string|boolean} [options.k] - simplification factor or 'auto'
 * @property {boolean} [options.rewind=false] - apply smartrewind
 * @property {boolean} [options.rewindPole=false] - if you use rewind, you can use this option to force rewind on polar polygons
 * @property {number} [options.clipOutline=0] - clip geometries near the antimeridian and poles (degrees) +/- the value given. If true, the value is set to 0.01 degree.
 */
export async function cleangeometry(
  data,
  { k, rewind = false, rewindPole = false, clipOutline = 0 } = {},
) {
  // Determine simplification factor
  const kval = k === "auto" || k === true ? undefined : k;

  let result = data;

  console.log("clipOutline", clipOutline);
  // Clip outline
  if (clipOutline) {
    if (clipOutline === true) clipOutline = 0.01;

    result = await clipbyrect(data, {
      bbox: [
        90 - clipOutline,
        180 - clipOutline,
        -90 + clipOutline,
        -180 + clipOutline,
      ],
    });
  }

  // Apply simplification
  result = simpl(result, { k: kval });

  // Apply smart rewind if requested
  if (rewind) {
    result = smartrewind(result, { rewindPole });
    result = await valid(result);
  }

  return result;
}
