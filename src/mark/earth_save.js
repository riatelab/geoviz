import { create } from "../container/create";
import { render } from "../container/render";
import { unique } from "../helpers/utils";
import { geoPath, geoIdentity, geoEquirectangular } from "d3-geo";
const d3 = Object.assign({}, { geoPath, geoIdentity, geoEquirectangular });

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
    scale: 2,
    url: "https://raw.githubusercontent.com/riatelab/geoviz/refs/heads/main/earth/HYP_50M_SR.png",
  };

  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

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
    i.src = opts.url;
    i.onload = () => resolve(i);
    i.onerror = reject;
  });

  // Downscale if needed
  const resizedImage = downscaleImage(img, MAX_CANVAS_SIZE);

  const canvas = document.createElement("canvas");
  canvas.width = svg.width * opts.scale;
  canvas.height = svg.height * opts.scale;
  const context = canvas.getContext("2d");

  const reproject = geoRasterReproject()
    .projection(svg.projection)
    .size([svg.width, svg.height]);

  reproject.context(context)(resizedImage);
  const url = context.canvas.toDataURL("image/png");

  opts._img = resizedImage;
  opts._canvas = canvas;

  const output = layer
    .append("image")
    .attr("href", url)
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svg.width * opts.scale)
    .attr("height", svg.height * opts.scale);

  const clipid = "clip" + opts.id;
  if (svg.select(`#${clipid}`).empty()) {
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", clipid)
      .append("path")
      .datum(opts.clipPath)
      .attr("d", d3.geoPath(svg.projection));
  }
  output.attr("clip-path", `url(#${clipid})`);

  return newcontainer ? render(svg) : `#${opts.id}`;
}

// Downscale large source image
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

// Reproject raster
function geoRasterReproject() {
  let context, projection, size;

  function reproject(image) {
    const dx = image.width,
      dy = image.height,
      w = size[0],
      h = size[1];

    context.drawImage(image, 0, 0, dx, dy);

    const sourceData = context.getImageData(0, 0, dx, dy).data,
      target = context.createImageData(w, h),
      targetData = target.data;

    for (let y = 0, i = -1; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        const p = projection.invert ? projection.invert([x, y]) : [0, 0];
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

    context.clearRect(0, 0, w, h);
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

  return reproject;
}

export function earthReproject(svg, opts) {
  const canvas = document.createElement("canvas");
  canvas.width = svg.width * opts.scale;
  canvas.height = svg.height * opts.scale;
  const context = canvas.getContext("2d");

  const reproject = geoRasterReproject()
    .projection(svg.projection)
    .size([svg.width, svg.height]);

  reproject.context(context)(opts._img);
  const url = canvas.toDataURL("image/png");

  const layer = svg.select(`#${opts.id}`);
  const image = layer.select("image");
  image
    .attr("href", url)
    .attr("width", svg.width * opts.scale)
    .attr("height", svg.height * opts.scale);

  if (opts.clipPath) {
    const clipid = "clip" + opts.id;
    const path = svg.select(`#${clipid} path`);
    if (!path.empty()) {
      path.datum(opts.clipPath).attr("d", d3.geoPath(svg.projection));
    }
  }
}
