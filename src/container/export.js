import { render } from "./render.js";

/**
 * @function exportSVG
 */
export function exportSVG(
  svg,
  { order = [], filename = "map.svg", font = null } = {},
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

  // 👉 EMBED FONT
  if (font) embedFont(clone, font);

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

  const blob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });

  downloadBlob(blob, filename);
}

/**
 * @function exportPNG
 */
export async function exportPNG(
  svg,
  { filename = "map.png", scale = 3, font = null } = {},
) {
  const svgNode = render(svg);
  const clone = svgNode.cloneNode(true);

  // 👉 EMBED FONT
  if (font) embedFont(clone, font);

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

  if (!clone.hasAttribute("viewBox") && width && height) {
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });

  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  // 👉 important pour les fonts
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
   Helpers
========================= */

function embedFont(svg, { fontName = "CustomFont", base64, format = "woff2" }) {
  if (!base64) return;

  let defs = svg.querySelector("defs");

  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.insertBefore(defs, svg.firstChild);
  }

  const style = document.createElementNS("http://www.w3.org/2000/svg", "style");

  style.textContent = `
    @font-face {
      font-family: '${fontName}';
      src: url(data:font/${format};base64,${base64}) format('${format}');
      font-weight: normal;
      font-style: normal;
    }
  `;

  defs.appendChild(style);
}

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
