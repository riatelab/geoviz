import { circle } from "../mark/circle";
import { spike } from "../mark/spike";
import { tile } from "../mark/tile";
import { scalebar } from "../mark/scalebar";
import { north } from "../mark/north";
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
        case "spike":
          d.zoom = { k: t.k, x: t.x, y: t.y };
          spike(svg, d);
          break;
        case "path":
          svg.selectAll(`#${d.id} > path`).attr("d", d.latlong ? path : path2);
          break;
        case "clippath":
          svg.selectAll(`#${d.id} > path`).attr("d", path);
          break;

        case "text":
          if (d.data && d.latlong == true) {
            svg
              .selectAll(`#${d.id} > text`)
              .attr("x", (d) => path.centroid(d.geometry)[0])
              .attr("y", (d) => path.centroid(d.geometry)[1])
              .attr("visibility", (d) =>
                isNaN(path.centroid(d.geometry)[0]) ? "hidden" : "visible"
              );
          } else if (d.data && d.latlong == false) {
            svg
              .selectAll(`#${d.id} > text`)
              .attr("x", (d) => path2.centroid(d.geometry)[0])
              .attr("y", (d) => path2.centroid(d.geometry)[1])
              .attr("visibility", (d) =>
                isNaN(path2.centroid(d.geometry)[0]) ? "hidden" : "visible"
              );
          } else if (!d.data && d.latlong == true) {
            const pos = path.centroid({ type: "Point", coordinates: d.pos });
            svg
              .selectAll(`#${d.id} > text`)
              .attr("x", pos[0])
              .attr("y", pos[1])
              .attr("visibility", (d) =>
                isNaN(pos[0]) ? "hidden" : "visible"
              );
          }
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

  // RESET
  svg.on("click", reset);
}
