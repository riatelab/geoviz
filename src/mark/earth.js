import { create } from "../container/create";
import { render } from "../container/render";
import { unique } from "../helpers/utils";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

/**
 * @async
 * @function earth
 * @description The `earth` function displays PNG files representing the Earth's surface. The sample data comes from Natural Earth. Credit as follows: Natural Earth. Free vector and raster map data @ naturalearthdata.com.
 *
 * @property {string} [id] - id of the layer
 * @property {string} [url = "NE2_50M_SR_W"] -URL of the image to display. You can choose one from this list [“GRAY_50M_SR”,   “GRAY_50M_SR_OB”,  “GRAY_50M_SR_W”,    ‘HYP_50M_SR’,  “HYP_50M_SR_W”,  “MSR_50M”, “NE1_50M_SR_W”, “NE2_50M_SR”,  “NE2_50M_SR_W”, “OB_50M”, ‘PRIMSA_SR_50M’, “SR_50M” ] or use your own URL. The images provided are from Natural Earth, reduced and compressed. Don't forget to credit the source.
 * @property {number} [resolution = 1] - Increase this number to increase the image resolution. 1 = normal resolution (1 pixel in the canvas = 1 visible tile pixel). 2 = double resolution (2 pixels in the canvas = 1 visible pixel) → the tile is rendered in double resolution, so it is more detailed/sharper (useful for Retina displays or high-quality exports) 3 = triple resolution, etc.
 * @property {number} [tileSize = 1024] - tile size (on-the-fly tiling of the input image)
 * @property {number} [opacity = 1] - opacity
 * @property {number} [dx = 0] - shift in x
 * @property {number} [dy = 0] - shift in y
 * @property {object} [clipPath] - a geojson to clip the image. By default, the outline is used.
 * @property {string} [max_canvas_size] - max_canvas_size is used to limit the maximum size (in pixels) of the raster image loaded or generated before using it for tile rendering. If the input image is too large, you can use this parameter to set a maximum size (width or height), for example 2048.
 * @example
 * // There are several ways to use this function
 * geoviz.earth(svg, {url: "NE2_50M_SR_W"}) // where svg is the container
 * svg.earth({url: "PRIMSA_SR_50M"}) // where svg is the container
 * svg.plot({type: "earth", url: "GRAY_50M_SR"}) // where svg is the container
 */
export async function earth(arg1, arg2) {
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
    tileSize: 1024,
    resolution: 1,
    url: "NE2_50M_SR_W",
    opacity: 1,
    dx: 0,
    dy: 0,
    max_canvas_size: undefined,
  };

  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  const TILE_SIZE =
    typeof opts.tileSize === "number" && opts.tileSize > 0
      ? opts.tileSize
      : 512;

  const TILE_RES =
    typeof opts.resolution === "number" && opts.resolution > 0
      ? opts.resolution
      : 1;

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

  const maxCanvasSize = opts.max_canvas_size;

  let resizedImage;
  if (maxCanvasSize && maxCanvasSize > 0) {
    resizedImage = await downscaleImageMaxSize(opts.url, maxCanvasSize);
  } else {
    resizedImage = await new Promise((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.src = geturl(opts.url);
      i.onload = () => resolve(i);
      i.onerror = reject;
    });
  }

  const scaledWidth = Math.floor(svg.width * opts.scale);
  const scaledHeight = Math.floor(svg.height * opts.scale);

  const tilesX = Math.ceil(scaledWidth / TILE_SIZE);
  const tilesY = Math.ceil(scaledHeight / TILE_SIZE);

  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id).attr("data-layer", "earth")
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  if (svg.zoomable && !svg.parent) {
    const existingIndex = svg.zoomablelayers.findIndex((d) => d.id === opts.id);
    if (existingIndex !== -1) {
      svg.zoomablelayers[existingIndex] = opts;
    } else {
      svg.zoomablelayers.push(opts);
    }
  }

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {

      const tileWidth = Math.min(TILE_SIZE, scaledWidth - tx * TILE_SIZE);
      const tileHeight = Math.min(TILE_SIZE, scaledHeight - ty * TILE_SIZE);

      const canvasWidth = tileWidth * TILE_RES;
      const canvasHeight = tileHeight * TILE_RES;

      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = canvasWidth;
      tileCanvas.height = canvasHeight;
      const tileCtx = tileCanvas.getContext("2d");
      tileCtx.imageSmoothingEnabled = false;

      const reproject = geoRasterReproject()
        .projection(svg.projection)
        .size([canvasWidth, canvasHeight]) 
        .tileViewport([tx * TILE_SIZE, ty * TILE_SIZE, tileWidth, tileHeight])
        .resolution(TILE_RES)
        .context(tileCtx);

      reproject(resizedImage);

      const tileUrl = tileCanvas.toDataURL("image/png");

      const x = Math.round(tx * TILE_SIZE + opts.dx);
      const y = Math.round(ty * TILE_SIZE + opts.dy);

      layer
        .append("image")
        .attr("href", tileUrl)
        .attr("x", x)
        .attr("y", y)
        .attr("width", tileWidth)
        .attr("height", tileHeight)
        .attr("opacity", opts.opacity)
        .attr("shape-rendering", "crispEdges")
        .attr("style", "image-rendering: pixelated")
        .attr("preserveAspectRatio", "none");
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

function geoRasterReproject() {
  let context,
    projection,
    size,
    resolution = 1;
  let viewport = null;

  function reproject(image) {
    const dx = image.width,
      dy = image.height,
      w = size[0],
      h = size[1];

    const offsetX = viewport ? viewport[0] : 0;
    const offsetY = viewport ? viewport[1] : 0;
    const width = viewport ? viewport[2] : w;
    const height = viewport ? viewport[3] : h;

    context.clearRect(0, 0, width * resolution, height * resolution);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = dx;
    tempCanvas.height = dy;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(image, 0, 0, dx, dy);
    const sourceData = tempCtx.getImageData(0, 0, dx, dy).data;

    const target = context.createImageData(
      width * resolution,
      height * resolution
    );
    const targetData = target.data;

    for (let y = 0, i = -1; y < height * resolution; ++y) {
      for (let x = 0; x < width * resolution; ++x) {
        const px = x / resolution + offsetX;
        const py = y / resolution + offsetY;

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

  reproject.resolution = function (_) {
    return arguments.length ? ((resolution = _), reproject) : resolution;
  };

  return reproject;
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

export function earthReproject(svg, opts) {
  const TILE_SIZE = opts.tileSize && opts.tileSize > 0 ? opts.tileSize : 512;

  const scaledWidth = Math.floor(svg.width * opts.scale);
  const scaledHeight = Math.floor(svg.height * opts.scale);

  const tilesX = Math.ceil(scaledWidth / TILE_SIZE);
  const tilesY = Math.ceil(scaledHeight / TILE_SIZE);

  const layer = svg.select(`#${opts.id}`);
  if (layer.empty()) return;

  const images = layer.selectAll("image").nodes();

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const idx = ty * tilesX + tx;
      const tileWidth = Math.min(TILE_SIZE, scaledWidth - tx * TILE_SIZE);
      const tileHeight = Math.min(TILE_SIZE, scaledHeight - ty * TILE_SIZE);
      console.log(
        `Tile [${tx},${ty}]: x=${tx * TILE_SIZE}, y=${
          ty * TILE_SIZE
        }, width=${tileWidth}, height=${tileHeight}`
      );

      const tileCanvas = document.createElement("canvas");
      tileCanvas.width = tileWidth;
      tileCanvas.height = tileHeight;
      const tileCtx = tileCanvas.getContext("2d");

      const reproject = geoRasterReproject()
        .projection(svg.projection)
        .size([tileWidth, tileHeight])
        .tileViewport([tx * TILE_SIZE, ty * TILE_SIZE, tileWidth, tileHeight])
        .context(tileCtx);

      reproject(opts._img);

      const tileUrl = tileCanvas.toDataURL("image/png");

      if (images[idx]) {
        images[idx].setAttribute("href", tileUrl);
        images[idx].setAttribute("width", tileWidth);
        images[idx].setAttribute("height", tileHeight);
      }
    }
  }

  if (opts.clipPath) {
    const clipid = "clip" + opts.id;
    const path = svg.select(`#${clipid} path`);
    if (!path.empty()) {
      path.datum(opts.clipPath).attr("d", d3.geoPath(svg.projection));
    }
  }
}

async function downscaleImageMaxSize(url, maxSize = 2048) {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.src = geturl(url);
    i.onload = () => {
      const ratio = Math.min(maxSize / i.width, maxSize / i.height, 1);
      if (ratio >= 1) return resolve(i);
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(i.width * ratio);
      canvas.height = Math.floor(i.height * ratio);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(i, 0, 0, canvas.width, canvas.height);
      resolve(canvas);
    };
    i.onerror = reject;
  });
}
