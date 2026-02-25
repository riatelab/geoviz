import { simplify as simpl, makevalid as valid, smartrewind } from "geotoolbox";

/**
 * Simplify GeoJSON with optional validity and rewind
 * @param {GeoJSON} data FeatureCollection
 * @param {Object} options
 * @param {number|string|boolean} [options.k] - simplification factor or 'auto'
 * @param {boolean} [options.rewind=false] - apply smartrewind
 * @param {boolean} [options.rewindPole=false] - force rewind on polar polygons
 */
export async function simplify(
  data,
  { k, rewind = false, rewindPole = false } = {},
) {
  // Determine simplification factor
  const kval = k === "auto" || k === true ? undefined : k;

  // Apply simplification
  let result = simpl(data, { k: kval });

  // Apply smart rewind if requested
  if (rewind) {
    result = smartrewind(result, { rewindPole });
    result = await valid(result);
  }

  return result;
}
