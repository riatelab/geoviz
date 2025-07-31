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
  const clone = svgNode.cloneNode(true);

  let width = parseFloat(clone.getAttribute("width"));
  let height = parseFloat(clone.getAttribute("height"));

  // Si width ou height sont manquants, calcul via BBox
  if (!width || !height) {
    try {
      const bbox = clone.getBBox?.() || { width: 800, height: 600 };
      width = bbox.width;
      height = bbox.height;
    } catch (err) {
      console.warn("Impossible de récupérer le BBox du SVG", err);
      width = 800;
      height = 600;
    }
  }

  // Fixe le `viewBox` si absent pour que le rendu soit cohérent
  if (!clone.hasAttribute("viewBox") && width && height) {
    clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  }

  // Sérialise le SVG en string
  const svgString = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    img.onload = () => {
      // Crée un canvas et y dessine l'image SVG
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Exporte le canvas en blob PNG
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Échec de conversion en PNG"));
          return;
        }

        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
        resolve();
      }, "image/png");
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error("Erreur chargement image SVG"));
    };

    img.src = url;
  });
}
