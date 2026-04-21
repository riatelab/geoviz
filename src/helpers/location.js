export function location(svg, precision, type = "Polygon") {
  let output;

  if (type == "point") {
    output = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates: svg.projection.invert([svg.width / 2, svg.height / 2]),
          },
        },
      ],
    };
  } else {
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

    output = {
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

  return output;
}
