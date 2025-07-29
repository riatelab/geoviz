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
export function exportPNG(
  svg,
  { order = [], filename = "map.png", scale = 3 } = {}
) {
  const svgNode = render(svg, { order });
  const clone = svgNode.cloneNode(true);

  if (!clone.getAttribute("width") || !clone.getAttribute("height")) {
    const bbox = clone.getBBox?.() || { width: 800, height: 600 };
    clone.setAttribute("width", bbox.width);
    clone.setAttribute("height", bbox.height);
  }

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);

  const utf8Bytes = new TextEncoder().encode(svgString);
  const binaryString = Array.from(utf8Bytes, (byte) =>
    String.fromCharCode(byte)
  ).join("");
  const base64 = btoa(binaryString);
  const imgSrc = `data:image/svg+xml;base64,${base64}`;

  const image = new Image();

  image.onload = () => {
    const width = parseFloat(clone.getAttribute("width")) * scale;
    const height = parseFloat(clone.getAttribute("height")) * scale;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("❌ toBlob failed: canvas is empty or invalid");
          return;
        }

        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
      },
      "image/png",
      1
    );
  };

  image.onerror = (err) => {
    console.error("❌ Error loading image from SVG", err);
  };

  image.src = imgSrc;
}
