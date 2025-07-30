import { create } from "../container/create";
import { render } from "../container/render";
import { unique } from "../helpers/utils";
import { geoPath } from "d3-geo";
const d3 = Object.assign({}, { geoPath });

export async function earth(arg1, arg2) {
  // Test if new container
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;

  // Arguments
  const options = {
    mark: "earth",
    id: unique(),
    clipPath: undefined,
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

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id).attr("data-layer", "tile")
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // zoomable layer
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

  // Reproject
  const reproject = geoRasterReproject()
    .projection(svg.projection)
    .size([svg.width, svg.height]);

  const canvas = document.createElement("canvas");
  canvas.width = svg.width * opts.scale;
  canvas.height = svg.height * opts.scale;
  const context = canvas.getContext("2d");

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.src = opts.url;
    i.onload = () => resolve(i);
    i.onerror = reject;
  });

  reproject.context(context)(img);
  const url = context.canvas.toDataURL("image/png");

  opts._img = img; // stocke l’image originale
  opts._canvas = canvas; // stocke le canvas si tu préfères

  const output = layer
    .append("image")
    .attr("href", url)
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svg.width * opts.scale)
    .attr("height", svg.height * opts.scale);

  if (opts.clipPath) {
    const clipid = "clip" + opts.id; // stable ID basé sur opts.id
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
  }

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}

// Reproject raster

function geoRasterReproject() {
  let context, projection, size;

  // See: https://bl.ocks.org/mbostock/4329423
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
        const p = projection.invert([x, y]);
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

  // Mise à jour du clipPath
  if (opts.clipPath) {
    const clipid = "clip" + opts.id;
    const path = svg.select(`#${clipid} path`);
    if (!path.empty()) {
      path.datum(opts.clipPath).attr("d", d3.geoPath(svg.projection));
    }
  }
}
