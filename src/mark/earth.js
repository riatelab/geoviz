import { create } from "../container/create";
import { render } from "../container/render";
import { unique } from "../helpers/utils";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

export async function earth(arg1, arg2) {
  console.log("fetch image");
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;

  const options = {
    mark: "earth",
    id: unique(),
    clipPath: { type: "Sphere" },
    scale: 1,
    tile_size: 1024,
    url: "NE2_50M_SR_W",
  };

  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  const TILE_SIZE =
    typeof opts.tile_size === "number" && opts.tile_size > 0
      ? opts.tile_size
      : 512;

  // New container
  let svgopts = {};
  Object.keys(opts)
    .filter((str) => str.slice(0, 4) == "svg_")
    .forEach((d) => {
      Object.assign(svgopts, {
        [d.slice(0, 4) == "svg_" ? d.slice(4) : d]: opts[d],
      });
      delete opts[d];
    });
  let svg = newcontainer ? create(svgopts) : arg1;

  // Safety: limit scale if too big
  const MAX_CANVAS_SIZE = 8192;
  const maxScale = Math.min(
    MAX_CANVAS_SIZE / svg.width,
    MAX_CANVAS_SIZE / svg.height,
    opts.scale
  );
  opts.scale = Math.min(opts.scale, maxScale);

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id).attr("data-layer", "tile")
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  if (svg.zoomable && !svg.parent) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      svg.zoomablelayers.push(opts);
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id)
      );
      svg.zoomablelayers[i] = opts;
    }
  }

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.src = geturl(opts.url);
    i.onload = () => resolve(i);
    i.onerror = reject;
  });

  const resizedImage = downscaleImage(img, MAX_CANVAS_SIZE);

  // Calcul taille finale en pixels
  const scaledWidth = Math.floor(svg.width * opts.scale);
  const scaledHeight = Math.floor(svg.height * opts.scale);

  // Nombre de tuiles horizontal/vertical
  const tilesX = Math.ceil(scaledWidth / TILE_SIZE);
  const tilesY = Math.ceil(scaledHeight / TILE_SIZE);

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const tileWidth = Math.min(TILE_SIZE, scaledWidth - tx * TILE_SIZE);
      const tileHeight = Math.min(TILE_SIZE, scaledHeight - ty * TILE_SIZE);

      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = tileWidth;
      tileCanvas.height = tileHeight;
      const tileCtx = tileCanvas.getContext("2d");

      const reproject = geoRasterReproject()
        .projection(svg.projection)
        .size([scaledWidth, scaledHeight])
        .tileViewport([tx * TILE_SIZE, ty * TILE_SIZE, tileWidth, tileHeight]);

      reproject.context(tileCtx)(resizedImage);

      const tileUrl = tileCanvas.toDataURL("image/png");

      layer
        .append("image")
        .attr("href", tileUrl)
        .attr("x", tx * TILE_SIZE)
        .attr("y", ty * TILE_SIZE)
        .attr("width", tileWidth)
        .attr("height", tileHeight);
    }
  }

  const clipid = "clip" + opts.id;
  if (svg.select(`#${clipid}`).empty()) {
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", clipid)
      .append("path")
      .datum(opts.clipPath)
      .attr("d", geoPath(svg.projection));
  }
  layer.attr("clip-path", `url(#${clipid})`);

  opts._img = resizedImage;

  return newcontainer ? render(svg) : `#${opts.id}`;
}

function downscaleImage(img, maxSize = 2048) {
  const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
  if (ratio >= 1) return img;

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(img.width * ratio);
  canvas.height = Math.floor(img.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function geoRasterReproject() {
  let context, projection, size;
  let viewport = null; // [offsetX, offsetY, width, height]

  function reproject(image) {
    const dx = image.width,
      dy = image.height,
      w = size[0],
      h = size[1];

    const offsetX = viewport ? viewport[0] : 0;
    const offsetY = viewport ? viewport[1] : 0;
    const width = viewport ? viewport[2] : w;
    const height = viewport ? viewport[3] : h;

    context.clearRect(0, 0, width, height);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = dx;
    tempCanvas.height = dy;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(image, 0, 0, dx, dy);
    const sourceData = tempCtx.getImageData(0, 0, dx, dy).data;

    const target = context.createImageData(width, height);
    const targetData = target.data;

    for (let y = 0, i = -1; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        const px = x + offsetX;
        const py = y + offsetY;

        const p = projection.invert ? projection.invert([px, py]) : [0, 0];
        const lambda = p ? p[0] : 0;
        const phi = p ? p[1] : 0;

        if (lambda > 180 || lambda < -180 || phi > 90 || phi < -90) {
          i += 4;
          continue;
        }

        let q =
          (((((90 - phi) / 180) * dy) | 0) * dx +
            ((((180 + lambda) / 360) * dx) | 0)) <<
          2;

        targetData[++i] = sourceData[q];
        targetData[++i] = sourceData[++q];
        targetData[++i] = sourceData[++q];
        targetData[++i] = 255;
      }
    }

    context.putImageData(target, 0, 0);
  }

  reproject.context = function (_) {
    return arguments.length ? ((context = _), reproject) : context;
  };

  reproject.projection = function (_) {
    return arguments.length ? ((projection = _), reproject) : projection;
  };

  reproject.size = function (_) {
    return arguments.length ? ((size = _), reproject) : size;
  };

  reproject.tileViewport = function (_) {
    return arguments.length ? ((viewport = _), reproject) : viewport;
  };

  return reproject;
}

export function earthReproject(svg, opts) {
  const MAX_CANVAS_SIZE = 8192;
  const TILE_SIZE = opts.tile_size && opts.tile_size > 0 ? opts.tile_size : 512;

  const scaledWidth = Math.floor(svg.width * opts.scale);
  const scaledHeight = Math.floor(svg.height * opts.scale);

  const tilesX = Math.ceil(scaledWidth / TILE_SIZE);
  const tilesY = Math.ceil(scaledHeight / TILE_SIZE);

  const layer = svg.select(`#${opts.id}`);
  if (layer.empty()) return;

  const images = layer.selectAll("image").nodes();

  // On suppose que les images ont été ajoutées dans le bon ordre (tilesX * tilesY)

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const idx = ty * tilesX + tx;
      const tileWidth = Math.min(TILE_SIZE, scaledWidth - tx * TILE_SIZE);
      const tileHeight = Math.min(TILE_SIZE, scaledHeight - ty * TILE_SIZE);

      // Canvas pour la tuile
      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = tileWidth;
      tileCanvas.height = tileHeight;
      const tileCtx = tileCanvas.getContext("2d");

      // Reprojection sur la tuile
      const reproject = geoRasterReproject()
        .projection(svg.projection)
        .size([scaledWidth, scaledHeight])
        .tileViewport([tx * TILE_SIZE, ty * TILE_SIZE, tileWidth, tileHeight]);

      reproject.context(tileCtx)(opts._img);

      const tileUrl = tileCanvas.toDataURL("image/png");

      if (images[idx]) {
        images[idx].setAttribute("href", tileUrl);
        images[idx].setAttribute("width", tileWidth);
        images[idx].setAttribute("height", tileHeight);
      }
    }
  }

  // Mise à jour du clip-path si besoin
  if (opts.clipPath) {
    const clipid = "clip" + opts.id;
    const path = svg.select(`#${clipid} path`);
    if (!path.empty()) {
      path.datum(opts.clipPath).attr("d", d3.geoPath(svg.projection));
    }
  }
}

function geturl(x) {
  return [
    "GRAY_50M_SR",
    "GRAY_50M_SR_OB",
    "GRAY_50M_SR_W",
    "HYP_50M_SR",
    "HYP_50M_SR_W",
    "MSR_50M",
    "NE1_50M_SR_W",
    "NE2_50M_SR",
    "NE2_50M_SR_W",
    "OB_50M",
    "PRIMSA_SR_50M",
    "SR_50M",
  ].includes(x)
    ? `https://raw.githubusercontent.com/riatelab/geoviz/refs/heads/main/earth/small/${x}.png`
    : x;
}
