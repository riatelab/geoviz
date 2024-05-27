import { circle } from "../mark/circle";
import { symbol } from "../mark/symbol";
import { square } from "../mark/square";
import { halfcircle } from "../mark/halfcircle";
import { spike } from "../mark/spike";
import { text } from "../mark/text";
import { tile } from "../mark/tile";
import { scalebar } from "../mark/scalebar";
import { north } from "../mark/north";
import { zoompanel } from "./zoompanel";
import { zoom, zoomTransform } from "d3-zoom";
import { geoPath, geoIdentity } from "d3-geo";
import { select } from "d3-selection";
import { interpolate } from "d3-interpolate";
import { transition } from "d3-transition";

const d3 = Object.assign(
  {},
  {
    transition,
    interpolate,
    zoom,
    geoPath,
    geoIdentity,
    zoomTransform,
    select,
  }
);

export function zoomandpan(svg) {
  let noproj = d3.geoIdentity();
  const path = d3.geoPath(svg.projection);
  const path2 = d3.geoPath(noproj);

  // Control Panel

  if (svg.control) {
    if (svg.selectAll(`#${svg.controlid}`).empty()) {
      zoompanel(svg);
    }

    svg
      .select("#buttonplus")
      .on("click", reset)
      .on("click", (e) => {
        const direction = 1; // -1 : zoom out
        handleClickZoom(direction);
      })
      .on("dblclick", (e) => {
        e.stopPropagation();
      });

    svg
      .select("#buttonminus")
      .on("click", reset)
      .on("click", (e) => {
        const direction = -1; // -1 : zoom out
        handleClickZoom(direction);
      })
      .on("dblclick", (e) => {
        e.stopPropagation();
      });
    svg
      .select("#buttonreset")
      .on("click", reset)
      .on("dblclick", (e) => {
        e.stopPropagation();
      });
  } else {
    svg.on("click", reset);
  }

  // ZOOM MOUSE
  svg.call(
    d3
      .zoom()
      .extent([
        [0, 0],
        [svg.width, svg.height],
      ])
      .scaleExtent(Array.isArray(svg.zoomable) ? svg.zoomable : [1, 8])
      .on("start", () => {
        svg.select("#geoviztooltip").style("visibility", "hidden");
      })
      .on("zoom", zoom)
  );

  function handleClickZoom(direction) {
    const zoomextent = Array.isArray(svg.zoomable) ? svg.zoomable : [1, 8];
    const factor = 0.2;
    const center = [svg.width / 2, svg.height / 2];
    const transform = d3.zoomTransform(svg.node());
    if (transform.k <= zoomextent[1] && transform.k >= zoomextent[0]) {
      const view = { ...transform };

      view.k = transform.k * (1 + factor * direction);
      view.k = view.k < zoomextent[0] ? zoomextent[0] : view.k;
      view.k = view.k > zoomextent[1] ? zoomextent[1] : view.k;

      // Compute new x and y values
      const translate0 = [
        (center[0] - transform.x) / transform.k,
        (center[1] - transform.y) / transform.k,
      ];
      view.x += center[0] - (translate0[0] * view.k + view.x);
      view.y += center[1] - (translate0[1] * view.k + view.y);

      transform.k = view.k;
      transform.x = view.x;
      transform.y = view.y;

      svg.projection
        .scale(transform.k * svg.baseScale)
        .translate([
          svg.baseTranslate[0] * transform.k + transform.x,
          svg.baseTranslate[1] * transform.k + transform.y,
        ]);

      noproj.scale(transform.k).translate([transform.x, transform.y]);
      svg.zoom = { k: transform.k, x: transform.x, y: transform.y };

      render(transform);
    }
  }

  // const baseScale = svg.projection.scale();
  // const baseTranslate = svg.projection.translate();

  // RESET
  function reset() {
    d3.zoomTransform(this).k = 1;
    d3.zoomTransform(this).x = 0;
    d3.zoomTransform(this).y = 0;
    svg.projection.scale(svg.baseScale).translate(svg.baseTranslate);
    noproj.scale(1).translate([0, 0]);
    render({ k: 1, x: 0, y: 0 });
  }

  // RENDER
  function render(t) {
    svg.zoomablelayers.forEach((d) => {
      switch (d.mark) {
        case "circle":
          d.zoom = { k: t.k, x: t.x, y: t.y };
          circle(svg, d);
          break;
        case "symbol":
          d.zoom = { k: t.k, x: t.x, y: t.y };
          symbol(svg, d);
          break;
        case "square":
          d.zoom = { k: t.k, x: t.x, y: t.y };
          square(svg, d);
          break;
        case "halfcircle":
          d.zoom = { k: t.k, x: t.x, y: t.y };
          halfcircle(svg, d);
          break;
        case "spike":
          d.zoom = { k: t.k, x: t.x, y: t.y };
          spike(svg, d);
          break;
        case "path":
          svg
            .selectAll(`#${d.id} > path`)
            .attr("d", d.coords == "svg" ? path2 : path);
          break;
        case "clippath":
          svg.selectAll(`#${d.id} > path`).attr("d", path);
          break;
        case "text":
          d.zoom = { k: t.k, x: t.x, y: t.y };
          text(svg, d);
          break;
        case "outline":
          svg.selectAll(`#${d.id} > path`).attr("d", path({ type: "Sphere" }));
          break;
        case "graticule":
          svg.selectAll(`#${d.id} > path`).attr("d", path);
          break;
        case "tile":
          tile(svg, d);
          break;
        case "scalebar":
          scalebar(svg, d);
          break;
        case "north":
          north(svg, d);
          break;
      }
    });
  }

  function zoom({ transform }) {
    // Adapt projection
    svg.projection
      .scale(transform.k * svg.baseScale)
      .translate([
        svg.baseTranslate[0] * transform.k + transform.x,
        svg.baseTranslate[1] * transform.k + transform.y,
      ]);

    noproj.scale(transform.k).translate([transform.x, transform.y]);
    svg.zoom = { k: transform.k, x: transform.x, y: transform.y };

    render(transform);
  }
}
