export function minimap(arg1, arg2) {
  // Test if new container
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;

  // Arguments by default
  const options = {
    id: unique(),
    width: 200,
    mark: "minimap",
    projection: "EqualEarth",
    precision: 10,
    pos: [10, 10],
    coords: "svg",
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // The container
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

  // init a layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id).attr("data-layer", "rhumbs")
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Get rectangle
  const rect = getRect(svg, opts.precision);

  //Draw minimap;

  let inset = create({
    parent: svg,
    projection: opts.projection,
    pos: opts.pos,
    width: opts.width,
  });
  inset.outline();
  inset.path({ datum: world, fill: "#CCC" });
  inset.path({ datum: rect, fill: "red" });

  // Zoom;
  if (svg.zoomable) {
    if (!svg.zoomablelayers.map((d) => d.id).includes(opts.id)) {
      svg.zoomablelayers.push(opts);
    } else {
      let i = svg.zoomablelayers.indexOf(
        svg.zoomablelayers.find((d) => d.id == opts.id),
      );
      svg.zoomablelayers[i] = opts;
    }
  }

  // Render
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}

// Helpers

function getRect(svg, precision) {
  const stepX = svg.width / precision;
  const stepY = svg.height / precision;

  const rangx = Array.from({ length: precision + 1 }, (_, i) => i * stepX);
  const rangy = Array.from({ length: precision + 1 }, (_, i) => i * stepY);

  const top = rangx.map((x) => svg.projection.invert([x, 0]));
  const right = rangy.map((y) => svg.projection.invert([svg.width, y]));
  const bottom = [...rangx]
    .reverse()
    .map((x) => svg.projection.invert([x, svg.height]));
  const left = [...rangy].reverse().map((y) => svg.projection.invert([0, y]));

  const ring = [...top, ...right, ...bottom, ...left];

  if (
    ring.length &&
    (ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1])
  ) {
    ring.push(ring[0]);
  }

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [ring],
        },
      },
    ],
  };
}
