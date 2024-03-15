import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash, getsize, unique } from "../helpers/utils";

/**
 * @function footer
 * @description The `footer` function allows add a source below the map. The function adds a layer to the SVG container and returns the layer identifier. If the container is not defined, then the layer is displayed directly.
 * @see {@link https://observablehq.com/@neocartocnrs/layout-marks}
 *
 * @property {string} [id] - id of the layer
 * @property {string} [text = "Author, source..."] - text to be displayed
 * @property {string} [fill = "#9e9696"] - text fill
 * @property {string} [background_fill = "white"] - background fill
 * @property {string} [background_stroke = "white"] - background stroke
 * @property {string} [background_strokeWidth = 1] - background stroke-width
 * @property {string} [dominantBaseline = "central"] - text dominant-baseline ("hanging", "middle", "central", "bottom")
 * @property {string} [textAnchor = "middle"] - text text-anchore ("start", "middle", "end")
 * @property {number} [lineSpacing = 0] - space between lines
 * @property {number} [margin = 1] - margin
 * @property {number} [fontSize = 10] - text font-size
 * @property {string} [fontFamily = fontFamily defined in the contrainer] - text font-family
 * @property {number} [dx = 0] - shift in x
 * @property {number} [dy = 0] - shift in y
 *
 * @example
 * // There are several ways to use this function
 * geoviz.footer(svg, { text: "Hello geoviz" }) // where svg is the container
 * svg.footer({ text: "Hello geoviz" }) // where svg is the container
 * svg.plot({ type: "footer", text: "Hello geoviz" }) // where svg is the container
 * geoviz.footer({ text: "Hello geoviz" }) // no container
 */

export function footer(arg1, arg2) {
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
    mark: "footer",
    id: unique(),
    text: "Author, source...",
    fill: "#9e9696",
    background_fill: "white",
    background_stroke: "white",
    background_strokeWidth: 1,
    dominantBaseline: "central",
    textAnchor: "middle",
    lineSpacing: 0,
    margin: 2,
    fontSize: 10,
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
  const lineheight = getsize(tmp).height;
  const nblines = opts.text.split("\n").length;
  const textheight = lineheight * nblines;
  const totalheight =
    textheight + (nblines - 1) * opts.lineSpacing + opts.margin * 2;
  tmp.remove();
  svg.height_footer = Math.max(svg.height_footer, totalheight);

  // Dipslay rect

  const background = layer
    .append("rect")
    .attr("x", 0)
    .attr("y", svg.height)
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
        svg.height +
        opts.margin +
        i * (lineheight + opts.lineSpacing) +
        lineheight / 2
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
      .attr("viewBox", [0, svg.height, svg.width, totalheight]);
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
