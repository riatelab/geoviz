import { unique } from "../helpers/unique";
import { northangle } from "../helpers/northangle";
import { mergeoptions } from "../helpers/mergeoptions";
import { create } from "../container/create";
import { render } from "../container/render";

/**
 * The `north` function allows add a North arrow.
 *
 * @param {SVGSVGElement} svg - SVG container as defined with the`container.init` function.
 * @param {object} options - options and parameters
 * @param {string} options.id - id of the layer
 * @param {number[]} options.pos - position [x,y] on the page. The scale value is relevant for this location on the map
 * @param {number} options.scale - a number to rescale the arrow
 * @param {number} options.rotate - an angle to rotate the arrow. By dedault, il is automaticaly calculated
 * @param {string} options.fill - fill color
 * @param {string} options.fillOpacity - fill-opacity
 * @example
 * geoviz.layer.north(svg, { pos: [100, 300], fill: "brown" })
 * @returns {SVGSVGElement|string} - the function adds a layer with a north arrow
 */

export function north(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;

  // Arguments
  let opts = mergeoptions(
    {
      mark: "north",
      id: unique(),
      pos: [svg.width - 30, 30],
      rotate: null,
      scale: 1,
      fill: "black",
      fillOpacity: 1,
    },
    newcontainer ? arg1 : arg2
  );

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
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

  // angle
  const angle =
    opts.rotate === null ? northangle(opts.pos, svg.projection) : opts.rotate;

  // Symbol
  let symbol =
    "M 0.044958496 -17.812349 C -0.26996119 -17.812349 -0.55343697 -17.592424 -0.67127686 -17.257345 L -8.3333415 4.589384 C -8.4444814 4.9067336 -8.3867007 5.2688235 -8.1855469 5.5205933 C -8.036827 5.7055621 -7.8301427 5.8063639 -7.6176229 5.8063639 C -7.541523 5.8063639 -7.4648555 5.7942066 -7.3902466 5.7676066 C -2.7097153 4.1075403 2.3000786 4.1096862 7.5003174 5.7743245 C 7.7838471 5.8647245 8.0866488 5.7625043 8.2826986 5.5112915 C 8.4787474 5.2601218 8.5328574 4.9026136 8.4232585 4.589384 L 0.76119385 -17.257345 C 0.64335397 -17.592424 0.35987718 -17.812349 0.044958496 -17.812349 z M 0.050126139 -14.540715 L 6.4238973 3.6313029 C 6.4089973 3.6273029 6.393912 3.6251008 6.378422 3.6204508 C 0.64157284 -2.0936385 0.097483092 -4.360355 0.050126139 -14.540715 z M -3.3693034 -12.968201 C -9.1352526 -11.453015 -13.401249 -6.1970669 -13.401249 0.03824056 C -13.401249 4.5709812 -11.148377 8.6866709 -7.540625 11.145056 A 8.3801446 8.3801446 0 0 1 -7.0967244 10.275342 C -10.385638 7.9859154 -12.4349 4.2025426 -12.4349 0.03824056 C -12.4349 -5.659418 -8.5956532 -10.47465 -3.3693034 -11.964128 L -3.3693034 -12.968201 z M 3.5574056 -12.940812 L 3.5574056 -11.936739 C 8.7345144 -10.415833 12.526367 -5.6244081 12.526367 0.03824056 C 12.526367 4.1909026 10.478884 7.9752639 7.19646 10.26759 A 8.3801446 8.3801446 0 0 1 7.6558634 11.126453 C 11.247977 8.6637544 13.492716 4.5522912 13.492716 0.03824056 C 13.492716 -6.161767 9.2740539 -11.392436 3.5574056 -12.940812 z M -3.6158 7.7333781 C -3.7267299 7.7341681 -3.8385828 7.7529054 -3.9475627 7.7897054 C -4.3841612 7.9364343 -4.6793009 8.3455548 -4.6793009 8.8072144 L -4.6793009 18.45262 C -4.6793009 19.045959 -4.1988131 19.526457 -3.6054647 19.526457 C -3.0121153 19.526457 -2.5321452 19.045959 -2.5321452 18.45262 L -2.5321452 12.003918 L 2.8411702 19.10116 C 3.04802 19.374569 3.3674991 19.526973 3.6974487 19.526973 C 3.8112586 19.526973 3.9261433 19.508463 4.0385132 19.471163 C 4.4758327 19.324443 4.7702515 18.914787 4.7702515 18.453137 L 4.7702515 8.8072144 C 4.7702515 8.2138749 4.2890446 7.7338949 3.6964152 7.7338949 C 3.1037968 7.7338949 2.6230957 8.2138749 2.6230957 8.8072144 L 2.6230957 15.25695 L -2.7502197 8.1597087 C -2.9590285 7.8833089 -3.2829703 7.7303491 -3.6158 7.7333781 z ";

  // layer
  layer
    .append("path")
    .attr("d", symbol)
    .attr("fill", opts.fill)
    .attr("fill-opacity", opts.fillOpacity)
    .attr(
      "transform",
      `translate(${opts.pos[0]},${opts.pos[1]}) rotate(${angle}) scale(${opts.scale})`
    );

  // Output
  if (newcontainer) {
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
