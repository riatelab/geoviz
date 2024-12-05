// rhumbs

export function rhumbs(arg1, arg2) {
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  let options = newcontainer ? arg1 : arg2;
  // Default values
  let opts = {
    nb: 5,
    pos: [1, 1],
  };
  opts = { ...opts, ...options };
  opts.datum = regularcircles(opts.step);
  let ids = `#${opts.id}`;
  let svg = newcontainer ? create({ projection: d3.geoNaturalEarth1() }) : arg1;





  
  if (newcontainer) {
    return render(svg);
  } else {
    return ids;
  }
}

// export function rhumbs(selection, width, height, clipid, options = {}) {
//   let visibility = options.visibility ? options.visibility : "visible";
//   let nb = options.nb != undefined ? options.nb : 16;
//   let position =
//     options.position != undefined
//       ? options.position
//       : [width / 4, height - height / 4];
//   let stroke = options.stroke ? options.stroke : "#394a70";
//   let strokeWidth = options.strokeWidth != undefined ? options.strokeWidth : 1;
//   let strokeOpacity =
//     options.strokeOpacity != undefined ? options.strokeOpacity : 0.3;
//   let strokeDasharray = options.strokeDasharray
//     ? options.strokeDasharray
//     : [3, 2];

//   let angles = getangle(nb);

//   let size = Math.max(width, height);

//   selection
//     .append("g")
//     .attr("class", options.id)
//     .attr("data-layer", JSON.stringify({ _type: "rhumbs" }))
//     .attr("fill", "none")
//     .attr("visibility", visibility)
//     .attr("stroke", stroke)
//     .attr("stroke-opacity", strokeOpacity)
//     .attr("stroke-width", strokeWidth)
//     .attr("stroke-dasharray", strokeDasharray)
//     .attr("clip-path", clipid == null ? `none` : `url(#clip_${clipid})`)
//     .selectAll("polyline")
//     .data(angles)
//     .join("polyline")
//     .attr("points", function (d, i) {
//       let x2 = position[0] + Math.cos(d) * size;
//       let y2 = position[1] + Math.sin(d) * size;
//       return position[0] + "," + position[1] + " " + x2 + "," + y2;
//     });
// }

function getangle(nb) {
  let angles = [];
  for (let i = 0; i < nb; i++) {
    angles[i] = (360 / nb) * i * (Math.PI / 180);
  }
  return angles;
}
