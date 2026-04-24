import { render } from "./render.js";

/* =========================
   EXPORT SVG
========================= */

/**
 * @function exportSVG
 * @description Exports a geoviz SVG as a downloadable file.
 * @param {Array} [options.order=[]] - Layer ordering (mainly for Observable environments).
 * @param {string} [options.filename="map.svg"] - Output file name.
 * @param {"web"|"portable"} [options.fontMode="web"] -
 * Font handling strategy:
 *  - "web": embeds fonts using @font-face (base64 or data URLs). Best for browsers.
 *  - "portable": removes embedded fonts and relies on system-installed fonts.
 *     Best for Inkscape / Illustrator compatibility.
 *
 * @example
 * viz.exportSVG(svg)
 *
 * @example
 * viz.exportSVG(svg, { filename: "map.svg", fontMode: "portable" })
 */
export function exportSVG(
  svg,
  { order = [], filename = "map.svg", fontMode = "web" } = {},
) {
  const NS = "http://www.w3.org/2000/svg";
  const XLINK = "http://www.w3.org/1999/xlink";
  const INK = "http://www.inkscape.org/namespaces/inkscape";
  const SODIPODI = "http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd";
  const ADOBE = "http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/";

  const svgNode = render(svg, { order });
  const clone = svgNode.cloneNode(true);

  clone.removeAttribute("id");

  clone.setAttribute("xmlns", NS);
  clone.setAttribute("xmlns:xlink", XLINK);
  clone.setAttribute("xmlns:inkscape", INK);
  clone.setAttribute("xmlns:sodipodi", SODIPODI);
  clone.setAttribute("xmlns:layer", ADOBE);

  // 👉 FONT MODE
  if (fontMode === "web") {
    embedFontsFromRegistry(clone);
  } else {
    stripFontEmbeds(clone);
  }

  clone.querySelectorAll("g[data-layer]").forEach((g) => {
    const layerName = g.getAttribute("data-layer") || "layer";

    g.setAttribute("id", layerName);
    g.setAttributeNS(INK, "groupmode", "layer");
    g.setAttributeNS(INK, "label", layerName);
    g.setAttributeNS(SODIPODI, "role", "layer");
    g.setAttributeNS(ADOBE, "name", layerName);
    g.removeAttribute("data-layer");
  });

  const tooltipLayer = clone.querySelector("g#geoviztooltip");
  if (tooltipLayer) tooltipLayer.remove();

  const svgString = new XMLSerializer().serializeToString(clone);

  downloadBlob(
    new Blob([svgString], { type: "image/svg+xml;charset=utf-8" }),
    filename,
  );
}

/* =========================
   EXPORT PNG
========================= */

/**
 * @function exportPNG
 * @description Exports a geoviz SVG as a high-resolution PNG image.
 *
 * The PNG is rendered using the browser canvas engine, ensuring visual fidelity
 * with the web rendering context.
 *
 * @param {string} [options.filename="map.png"] - Output file name.
 * @param {number} [options.scale=3] - Resolution multiplier (2 = HD, 3 = print quality).
 *
 * @example
 * viz.exportPNG(svg)
 *
 * @example
 * viz.exportPNG(svg, { scale: 4, filename: "map.png" })
 */
export async function exportPNG(svg, { filename = "map.png", scale = 3 } = {}) {
  const svgNode = render(svg);
  const clone = svgNode.cloneNode(true);

  // PNG = web mode (fonts must exist)
  embedFontsFromRegistry(clone);

  let width = parseFloat(clone.getAttribute("width"));
  let height = parseFloat(clone.getAttribute("height"));

  if (!width || !height) {
    try {
      const bbox = clone.getBBox?.() || { width: 800, height: 600 };
      width = bbox.width;
      height = bbox.height;
    } catch {
      width = 800;
      height = 600;
    }
  }

  if (!clone.hasAttribute("viewBox")) {
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  const svgString = new XMLSerializer().serializeToString(clone);

  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });

  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  if (document.fonts) {
    await document.fonts.ready;
  }

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("PNG conversion failed"));
          return;
        }

        downloadBlob(blob, filename);
        URL.revokeObjectURL(url);
        resolve();
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG image load error"));
    };

    img.src = url;
  });
}

/* =========================
   HELPERS
========================= */

function embedFontsFromRegistry(svg) {
  const fonts = window.__geoviz_fonts__ || [];
  if (!fonts.length) return;

  let defs = svg.querySelector("defs");

  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.insertBefore(defs, svg.firstChild);
  }

  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");

  let css = "";

  for (const f of fonts) {
    if (!f.base64) continue;

    css += `
      @font-face {
        font-family: '${f.fontFamily}';
        src: url(data:font/${f.format};base64,${f.base64}) format('${f.format}');
        font-style: ${f.style || "normal"};
        font-weight: ${f.weight || "normal"};
      }
    `;
  }

  style.textContent = css;
  defs.appendChild(style);
}

/* 👉 MODE INKSCAPE SAFE */
function stripFontEmbeds(svg) {
  const defs = svg.querySelector("defs");
  if (!defs) return;

  defs.querySelectorAll("style").forEach((s) => {
    if (s.textContent.includes("@font-face")) {
      s.remove();
    }
  });
}

/* =========================
   DOWNLOAD
========================= */

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
