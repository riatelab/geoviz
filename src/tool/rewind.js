import { smartrewind } from "geotoolbox";

/**
 * Rewind a GeoJSON FeatureCollection. A homemade approach that tries to work in most cases. The rewindPole parameter allows forcing the rewind of polar polygons.
 * Based on geotoolbox.streamRewind
 * @param {GeoJSON} data - The input GeoJSON FeatureCollection
 * @param {Object} options
 * @param {boolean} [options.mutate=false] - If false, a copy of the GeoJSON is returned; the original is not modified
 * @param {boolean} [options.rewindPole=false] - If true, forces rewind of polar polygons (Antarctic/Arctic)
 */

export function rewind(data, options = {}) {
  return smartrewind(data, options);
}
