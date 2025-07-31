import { render } from "./render.js";

/**
 * @function exportSVG
 * @description The `exportSVG` function returns the svg document as a file.
 * @see {@link https://observablehq.com/@neocartocnrs/geoviz}
 *
 * @property {SVGSVGElement} svg - SVG container to display. This can be generated using the `create` function.
 * @property {object[]} [order = []] - array determining the order of layers. This option is only useful in Observable notebooks (because of its topological nature).
 * @property {string} [filename = "map.svg"] - name of the downloaded file
 * @example
 * geoviz.exportSVG(svg, {filename: "worldmap.svg"}) // where svg is the container
 * svg.exportSVG({filename: "worldmap.svg"}}) // where svg is the container
 */
export function exportSVG(svg, { order = [], filename = "map.svg" } = {}) {
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
  if (tooltipLayer) {
    tooltipLayer.remove();
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);

  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * @function exportPNG
 * @description The `exportPNG` function returns the map as a png file.
 * @see {@link https://observablehq.com/@neocartocnrs/geoviz}
 *
 * @property {SVGSVGElement} svg - SVG container to display. This can be generated using the `create` function.
 * @property {object[]} [order = []] - array determining the order of layers. This option is only useful in Observable notebooks (because of its topological nature).
 * @property {Number} [scale = 3] - a number to enlarge the generated map and increase its resolution
 * @property {string} [filename = "map.png"] - name of the downloaded file
 * @example
 * geoviz.exportPNG(svg, {filename: "worldmap.png"}) // where svg is the container
 * svg.exportPNG({filename: "worldmap.png"}}) // where svg is the container
 */
export async function exportPNG(svg, { filename = "map.png", scale = 3 } = {}) {
  const svgNode = render(svg);

  let width = parseFloat(svgNode.getAttribute("width"));
  let height = parseFloat(svgNode.getAttribute("height"));
  if (!width || !height) {
    const bbox = svgNode.getBBox?.() || { width: 800, height: 600 };
    width = bbox.width;
    height = bbox.height;
  }

  const clone = svgNode.cloneNode(true);
  const images = Array.from(clone.querySelectorAll("image"));

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        resolve(img);
      };
      img.onerror = (e) => {
        reject(e);
      };
      img.src = src;
    });
  }

  for (const imgElem of images) {
    const href =
      imgElem.getAttributeNS("http://www.w3.org/1999/xlink", "href") ||
      imgElem.getAttribute("href");

    if (!href) continue;

    const x = parseFloat(imgElem.getAttribute("x") || 0);
    const y = parseFloat(imgElem.getAttribute("y") || 0);
    const w = parseFloat(imgElem.getAttribute("width") || 0);
    const h = parseFloat(imgElem.getAttribute("height") || 0);

    try {
      const tileImg = await loadImage(href);
      ctx.drawImage(tileImg, x * scale, y * scale, w * scale, h * scale);
    } catch (err) {
      console.warn("Erreur chargement tuile pour export", href, err);
    }
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
}
