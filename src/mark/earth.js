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
  // let svg = newcontainer
  //   ? create({ projection: geoMercator(), zoomable: true })
  //   : arg1;

  // Arguments
  const options = {
    mark: "earth",
    id: unique(),
    clipPath: undefined,
    scale: 2,
    url: "https://static.observableusercontent.com/files/5d96db98787b6554710845d34afb8ee1d976a4334791ee63a058f720a7776e57c1b903d82b8de10fc45134749b4b7759f4240484d43a82b5ea1349df4f3b2c02",
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

  const output = layer
    .append("image")
    .attr("href", url)
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svg.width * opts.scale)
    .attr("height", svg.height * opts.scale);

  if (opts.clipPath) {
    const clipid = "clip" + unique();
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", clipid)
      .append("path")
      .datum(opts.clipPath)
      .attr("d", d3.geoPath(svg.projection));
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
        //const p = projection.invert ? projection.invert([x, y]) : [0, 0];
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
