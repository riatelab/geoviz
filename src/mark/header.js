import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash, getsize, unique } from "../helpers/utils";

/**
 * @function header
 * @description The `header` function allows add a title above the map
 * @see {@link https://observablehq.com/@neocartocnrs/layout-marks}
 *
 * @property {string} id - id of the layer
 * @property {string} text - text to be displayed (default: "Map title")
 * @property {string} fill - text fill (default: "#9e9696")
 * @property {string} background_fill - background fill (default: "white")
 * @property {string} background_stroke - background stroke (default: "white")
 * @property {string} background_strokeWidth - background stroke-width (default: 1)
 * @property {string} dominantBaseline - text dominant-baseline ("hanging", "middle", "central", "bottom") (default: "central")
 * @property {string} textAnchor - text text-anchore ("start", "middle", "end") (default: "middle")
 * @property {number} lineSpacing - space between lines (default: 0)
 * @property {number} margin - margin (default: 8)
 * @property {number} fontSize - text font-size (default: 26)
 * @property {string} fontFamily - text font-family (default: fontFamily defined in the contrainer)
 * @property {number} dx - shift in x (default: 0)
 * @property {number} dy - shift in y (default: 0))
 *
 * @example
 * // There are several ways to use this function
 * geoviz.header(svg, { text: "Hello geoviz" }) // where svg is the container
 * svg.header({ text: "Hello geoviz" }) // where svg is the container
 * svg.plot({ type: "header",text: "Hello geoviz" }) // where svg is the container
 * geoviz.header({ text: "Hello geoviz" }) // no container
 * @returns {SVGSVGElement|string} - the function adds a layer with a header. If the container is not defined, then the layer is displayed directly.
 */

export function header(arg1, arg2) {
  // Test if new container
  let newcontainer =
    (arguments.length <= 1 || arguments[1] == undefined) &&
    !arguments[0]?._groups
      ? true
      : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;
  // Arguments

  const options = {
    mark: "header",
    id: unique(),
    text: "Map title",
    fill: "#9e9696",
    background_fill: "white",
    background_stroke: "white",
    background_strokeWidth: 1,
    dominantBaseline: "central",
    textAnchor: "middle",
    lineSpacing: 0,
    margin: 8,
    fontSize: 26,
    dx: 0,
    dy: 0,
    fontFamily: svg.fontFamily,
  };
  let opts = { ...options, ...(newcontainer ? arg1 : arg2) };

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Specific attributes
  let entries = Object.entries(opts).map((d) => d[0]);
  const notspecificattr = entries.filter((d) => !["mark", "id"].includes(d));

  // Text size
  const tmp = layer
    .append("text")
    .attr("font-family", opts.fontFamily)
    .attr("font-size", opts.fontSize)
    .text(opts.text.toString());
  const lineheight = getsize(layer).height;
  const nblines = opts.text.split("\n").length;
  const textheight = lineheight * nblines;
  const totalheight =
    textheight + (nblines - 1) * opts.lineSpacing + opts.margin * 2;
  tmp.remove();
  svg.height_header = Math.max(svg.height_header, totalheight);

  // Dipslay rect

  const background = layer
    .append("rect")
    .attr("x", 0)
    .attr("y", -totalheight)
    .attr("width", svg.width)
    .attr("height", totalheight);

  notspecificattr
    .filter((str) => str.includes("background_"))
    .forEach((d) => {
      background.attr(camelcasetodash(d.replace("background_", "")), opts[d]);
    });

  // Display text

  let posx = svg.width / 2;
  switch (opts.textAnchor) {
    case "start":
      posx = opts.margin;
      break;
    case "end":
      posx = svg.width - opts.margin;
      break;
  }

  const text = layer
    .selectAll("text")
    .data(opts.text.split("\n"))
    .join("text")
    .attr("x", posx)
    .attr(
      "y",
      (d, i) =>
        i * (lineheight + opts.lineSpacing) -
        totalheight +
        lineheight / 2 +
        opts.margin
    )
    .attr("dy", opts.dy)
    .text((d) => d);

  notspecificattr
    .filter((str) => !str.includes("background_"))
    .forEach((d) => {
      text.attr(camelcasetodash(d), opts[d]);
    });

  // Ajust svg height
  svg
    .attr("width", svg.width)
    .attr("height", svg.height + svg.height_header + svg.height_footer)
    .attr("viewBox", [
      0,
      -svg.height_header,
      svg.width,
      svg.height + svg.height_header + svg.height_footer,
    ]);

  // Output
  if (newcontainer) {
    svg
      .attr("width", svg.width)
      .attr("height", totalheight)
      .attr("viewBox", [0, -totalheight, svg.width, totalheight]);
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
