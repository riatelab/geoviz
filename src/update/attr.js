/**
 * Modify one or multiple layers in one or more SVG maps with a D3 transition.
 *
 * @param {Object} options - Options object
 * @param {string|string[]} [options.map] - SVG id or array of SVG ids (optional). If omitted, modifies all matching layers in the document.
 * @param {string|string[]} options.layer - Layer id or array of layer ids to modify.
 * @param {Object} [options.attrs={}] - SVG attributes to modify. Values can be static or functions (d, i, nodes) => value.
 * @param {Object} [options.styles={}] - CSS styles to modify. Values can be static or functions.
 * @param {number} [options.duration=500] - Duration of the transition in milliseconds.
 * @param {number} [options.delay=0] - Delay before the transition starts in milliseconds.
 * @param {Function} [options.onEnd] - Callback function to execute after the transition ends.
 */
export function attr({
  map,
  layer,
  attrs = {},
  styles = {},
  duration = 500,
  delay = 0,
  onEnd,
}) {
  // Normalize map and layer inputs to arrays for uniform processing
  const maps = map ? (Array.isArray(map) ? map : [map]) : [null];
  const layers = Array.isArray(layer) ? layer : [layer];

  maps.forEach((mapId) => {
    // Select container: specific SVG or document if mapId is null
    const container = mapId ? d3.select(`#${mapId}`) : d3.select(document);

    if (mapId && container.empty()) {
      console.warn(`Map with id "${mapId}" not found`);
      return;
    }

    layers.forEach((layerId) => {
      // Select all matching layers inside the container
      const layerSel = mapId
        ? container.select(`#${layerId}`)
        : container.selectAll(`#${layerId}`);

      if (layerSel.empty()) {
        console.warn(
          `Layer "${layerId}" not found${mapId ? ` in map "${mapId}"` : ""}`
        );
        return;
      }

      // Apply transition
      const t = layerSel.transition().delay(delay).duration(duration);

      // Apply SVG attributes
      Object.entries(attrs).forEach(([key, value]) => t.attr(key, value));
      // Apply CSS styles
      Object.entries(styles).forEach(([key, value]) => t.style(key, value));

      // Callback at the end of the transition
      if (onEnd) t.on("end", onEnd);
    });
  });
}
