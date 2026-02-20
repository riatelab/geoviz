import { select } from "d3-selection";
import { geoPath } from "d3-geo";
import { create } from "../container/create";
import { unique } from "../helpers/utils";

/**
 * @function pattern
 * @description
 * Creates a reusable SVG pattern for thematic or cartographic maps. The pattern
 * can be applied to any SVG shape (rect, path, etc.) and supports multiple
 * textures: lines, cross, dots, waves, triangles, zigzag. Patterns can also be
 * clipped to a GeoJSON geometry or the outline of the Earth (sphere).
 *
 * The function can either create a new SVG container or use an existing one.
 *
 * @param {object|SVGElement} arg1 - If creating a new pattern, this is the options object.
 *                                   If using an existing SVG container, this is the SVG element.
 * @param {object} [arg2] - Options object when using an existing SVG container.
 *
 * Options supported (all optional):
 * @param {string} [mark="pattern"] - Name of the mark/layer.
 * @param {string} [id] - Unique ID for the pattern. Default is generated automatically.
 * @param {number} [spacing=6] - Distance between pattern elements in pixels.
 * @param {number} [angle=0] - Rotation angle of the pattern in degrees.
 * @param {string|null} [fill=null] - Fill color of the pattern elements (default none).
 * @param {string} [stroke="#786d6c"] - Stroke color of pattern elements.
 * @param {number} [strokeWidth=2] - Stroke width of pattern elements.
 * @param {number} [strokeOpacity=0.1] - Stroke opacity of pattern elements.
 * @param {number} [fillOpacity=1] - Fill opacity of pattern elements.
 * @param {string|null} [strokeDasharray=null] - Stroke dash array for lines.
 * @param {string} [strokeLinecap="butt"] - Line cap style: "butt", "round", "square".
 * @param {string} [strokeLinejoin="miter"] - Line join style: "miter", "round", "bevel".
 * @param {number} [strokeMiterlimit=4] - Miter limit for joins.
 * @param {number} [opacity=1] - Overall opacity of pattern elements.
 * @param {string} [visibility="visible"] - SVG visibility property.
 * @param {string|null} [display=null] - SVG display property.
 * @param {string} [pattern="lines"] - Pattern type: "lines", "cross", "dots", "waves", "triangles", "zigzag".
 * @param {object|null} [data=null] - Optional GeoJSON object to clip the pattern.
 * @param {boolean} [clipOutline=false] - If true, pattern is clipped to the Earth outline.
 *
 * @returns {SVGElement|string} Returns the SVG node if creating a new container,
 *                              or the pattern ID selector (e.g., "#hatch123") if using an existing container.
 */
export function pattern(arg1, arg2) {
  const newContainer = !arg2 && !arg1?._groups;
  arg1 = newContainer && !arg1 ? {} : arg1;
  arg2 = arg2 || {};

  // Default options
  const opts = Object.assign(
    {
      mark: "pattern",
      id: unique(),
      spacing: 6,
      angle: 0,
      stroke: "#786d6c",
      fill: null,
      strokeWidth: 2,
      strokeOpacity: 0.1,
      fillOpacity: 1,
      strokeDasharray: null,
      strokeLinecap: "butt",
      strokeLinejoin: "miter",
      strokeMiterlimit: 4,
      opacity: 1,
      visibility: "visible",
      display: null,
      pattern: "lines", // "lines", "cross", "dots", "waves", "triangles", "zigzag"
      data: null,
      clipOutline: false,
    },
    newContainer ? arg1 : arg2,
  );

  const svg = newContainer ? create() : arg1;

  // Create or select defs
  let defs = svg.select("#defs");
  if (defs.empty()) defs = svg.append("defs");
  defs.select(`#hatch${opts.id}`).remove();

  // Create pattern element
  const pattern = defs
    .append("pattern")
    .attr("id", `hatch${opts.id}`)
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", opts.spacing)
    .attr("height", opts.spacing)
    .attr("patternTransform", `rotate(${opts.angle})`);

  // Pattern types
  switch (opts.pattern) {
    case "lines":
      applyGraphicAttrs(
        pattern
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", opts.spacing),
        opts,
      );
      break;

    case "cross":
      applyGraphicAttrs(
        pattern
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", opts.spacing),
        opts,
      );
      applyGraphicAttrs(
        pattern
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", opts.spacing)
          .attr("y2", 0),
        opts,
      );
      break;

    case "dots":
      applyGraphicAttrs(
        pattern
          .append("circle")
          .attr("cx", opts.spacing / 2)
          .attr("cy", opts.spacing / 2)
          .attr("r", opts.strokeWidth),
        opts,
      );
      break;

    case "waves":
      const waveH = opts.spacing / 2;
      const waveW = opts.spacing;
      applyGraphicAttrs(
        pattern
          .append("path")
          .attr(
            "d",
            `
            M0,${waveH} 
            Q${waveW / 4},0 ${waveW / 2},${waveH} 
            T${waveW},${waveH}
          `,
          )
          .attr("fill", "none"),
        opts,
      );
      break;

    case "triangles":
      applyGraphicAttrs(
        pattern
          .append("path")
          .attr(
            "d",
            `M0,${opts.spacing} L${opts.spacing / 2},0 L${opts.spacing},${opts.spacing} Z`,
          ),
        opts,
      );
      break;

    case "zigzag":
      applyGraphicAttrs(
        pattern
          .append("path")
          .attr(
            "d",
            `
            M0,${opts.spacing / 2} 
            L${opts.spacing / 4},0 
            L${opts.spacing / 2},${opts.spacing / 2} 
            L${(3 * opts.spacing) / 4},0 
            L${opts.spacing},${opts.spacing / 2}
          `,
          )
          .attr("fill", "none"),
        opts,
      );
      break;
  }

  // Main hatch layer
  let layer = svg.select(`#${opts.id}`);
  if (layer.empty())
    layer = svg.append("g").attr("id", opts.id).attr("data-layer", "hatch");

  const w = isFinite(svg.width) ? svg.width : 1000;
  const h = isFinite(svg.height) ? svg.height : 100;

  // Add to zoomable layers if needed
  if (svg.zoomable && !svg.parent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id))
      svg.zoomablelayers.push({ mark: opts.mark, id: opts.id, node: layer });
    else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id),
      );
      svg.zoomablelayers[i] = { mark: opts.mark, id: opts.id, node: layer };
    }
  }

  // Hatch group
  let hatchGroup = layer.select(".hatch-group");
  if (hatchGroup.empty())
    hatchGroup = layer.append("g").attr("class", "hatch-group");

  // Apply pattern to rect
  let rect = hatchGroup
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", h)
    .attr("fill", `url(#hatch${opts.id})`);

  // Clip path
  let clipUrl;
  if (opts.data) clipUrl = makeClipPath(svg, { datum: opts.data });
  if (opts.clipOutline)
    clipUrl = makeClipPath(svg, { datum: { type: "Sphere" } });
  if (clipUrl) rect.attr("clip-path", clipUrl);

  if (newContainer) {
    svg.attr("width", w).attr("height", h).attr("viewBox", [0, 0, w, h]);
    return svg.node();
  } else {
    return `#${opts.id}`;
  }
}

/**
 * @function applyGraphicAttrs
 * @description Applies all relevant SVG graphic attributes to a selection.
 * Defaults: stroke only, fill transparent.
 */
function applyGraphicAttrs(selection, opts) {
  return selection
    .attr("fill", opts.fill || "none")
    .attr("fill-opacity", opts.fillOpacity != null ? opts.fillOpacity : 1)
    .attr("stroke", opts.stroke || "#000")
    .attr("stroke-width", opts.strokeWidth != null ? opts.strokeWidth : 1)
    .attr("stroke-opacity", opts.strokeOpacity != null ? opts.strokeOpacity : 1)
    .attr("stroke-dasharray", opts.strokeDasharray || "none")
    .attr("stroke-linecap", opts.strokeLinecap || "butt")
    .attr("stroke-linejoin", opts.strokeLinejoin || "miter")
    .attr(
      "stroke-miterlimit",
      opts.strokeMiterlimit != null ? opts.strokeMiterlimit : 4,
    )
    .attr("opacity", opts.opacity != null ? opts.opacity : 1)
    .attr("visibility", opts.visibility || "visible")
    .attr("display", opts.display || null);
}

/**
 * @function makeClipPath
 * @description Creates a reusable clipPath for geographic clipping.
 */
function makeClipPath(
  svg,
  { id = unique(), datum = { type: "Sphere" }, permanent = false },
) {
  let defs = svg.select("#defs");
  if (defs.empty()) defs = svg.append("defs");

  defs.select(`#${id}`).remove();

  let layer = defs.append("clipPath").attr("id", id);
  layer.append("path").datum(datum).attr("d", geoPath(svg.projection));

  if (svg.zoomable && !svg.parent && !permanent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(id)) {
      svg.zoomablelayers.push({ mark: "clippath", id });
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == id),
      );
      svg.zoomablelayers[i] = { mark: "clippath", id };
    }
  }

  return `url(#${id})`;
}
