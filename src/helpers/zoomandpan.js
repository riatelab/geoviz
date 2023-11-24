import { circle } from "../mark/circle";
import { triangle } from "../mark/triangle";
import { label } from "../mark/label";
import { tile } from "../mark/tile";
import { scalebar } from "../mark/scalebar";
import { north } from "../mark/north";
import { zoom, zoomTransform } from "d3-zoom";
import { geoPath, geoIdentity } from "d3-geo";
import { select } from "d3-selection";

const d3 = Object.assign(
  {},
  {
    zoom,
    geoPath,
    geoIdentity,
    zoomTransform,
    select,
  }
);

export function zoomandpan(svg) {
  let noproj = d3.geoIdentity();
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

  function reset() {
    d3.zoomTransform(this).k = 1;
    d3.zoomTransform(this).x = 0;
    d3.zoomTransform(this).y = 0;
    svg.projection.scale(svg.baseScale).translate(svg.baseTranslate);
    noproj = d3.geoIdentity().scale(1).translate([0, 0]);
    render({ k: 1, x: 0, y: 0 });
  }

  function render(t) {
    svg.zoomablelayers.forEach((d) => {
      const path = d3.geoPath(svg.projection);
      const path2 = d3.geoPath(noproj);
      switch (d.mark) {
        case "circle":
          if (!d.latlong) {
            d.zoom = { k: t.k, x: t.x, y: t.y };
          }
          circle(svg, d);
          break;
        case "triangle":
          if (!d.latlong) {
            d.zoom = { k: t.k, x: t.x, y: t.y };
          }
          triangle(svg, d);
          break;
        case "geopath":
          svg.selectAll(`#${d.id} > path`).attr("d", d.latlong ? path : path2);
          break;
        case "clippath":
          svg.selectAll(`#${d.id} > path`).attr("d", path);
          break;
        case "label":
          if (!d.latlong) {
            d._zoom = { k: t.k, x: t.x, y: t.y };
          }
          label(svg, d);
          break;
        case "text": // TODO (possibilité de rentrer des lat lon comme position)
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
  svg.on("click", reset);
}
