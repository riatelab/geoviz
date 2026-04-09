import { circle } from "../mark/circle";
import { sketch } from "../mark/sketch";
import { contour } from "../mark/contour";
import { rhumbs } from "../mark/rhumbs";
import { symbol } from "../mark/symbol";
import { square } from "../mark/square";
import { halfcircle } from "../mark/halfcircle";
import { spike } from "../mark/spike";
import { earthReproject } from "../mark/earth";
import { text } from "../mark/text";
import { tile } from "../mark/tile";
import { scalebar } from "../mark/scalebar";
import { north } from "../mark/north";
import { zoompanel } from "./zoompanel";
import { zoom, zoomTransform, zoomIdentity } from "d3-zoom";
import { geoPath, geoIdentity } from "d3-geo";
import { select } from "d3-selection";
import { interpolate } from "d3-interpolate";
import { transition } from "d3-transition";
import { cleangeometry } from "../tool/cleangeometry.js";

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
    zoomIdentity,
  },
);

export async function zoomandpan(svg) {
  let noproj = d3.geoIdentity();
  const path = d3.geoPath(svg.projection);

  // --- Control Panel ---
  if (svg.control) {
    if (svg.selectAll(`#${svg.controlid}`).empty()) zoompanel(svg);

    const btnPlus = svg.select("#buttonplus");
    const btnMinus = svg.select("#buttonminus");
    const btnReset = svg.select("#buttonreset");

    btnPlus
      .on("click", (e) => {
        e.stopPropagation();
        handleClickZoom(1);
      })
      .on("dblclick", (e) => e.stopPropagation());

    btnMinus
      .on("click", (e) => {
        e.stopPropagation();
        handleClickZoom(-1);
      })
      .on("dblclick", (e) => e.stopPropagation());

    btnReset
      .on("click", (e) => {
        e.stopPropagation();
        reset();
      })
      .on("dblclick", (e) => e.stopPropagation());
  } else {
    svg.on("click", reset);
  }

  // --- D3 Zoom Behavior ---
  const zoomBehavior = d3
    .zoom()
    .filter((event) => {
      if (event.type === "wheel") event.preventDefault();
      return true;
    })
    .extent([
      [0, 0],
      [svg.width, svg.height],
    ])
    .scaleExtent(Array.isArray(svg.zoomable) ? svg.zoomable : [1, 8])
    .on("start", () =>
      svg.select("#geoviztooltip").style("visibility", "hidden"),
    )
    .on("zoom", zoomed);

  svg.call(zoomBehavior);

  // --- Zoom click buttons ---
  function handleClickZoom(direction) {
    const zoomextent = Array.isArray(svg.zoomable) ? svg.zoomable : [1, 8];
    const factor = 0.2;
    const center = [svg.width / 2, svg.height / 2];
    const transform = d3.zoomTransform(svg.node());

    let newK = transform.k * (1 + factor * direction);
    newK = Math.max(zoomextent[0], Math.min(zoomextent[1], newK));

    // Compute new x/y to zoom around center
    const translate0 = [
      (center[0] - transform.x) / transform.k,
      (center[1] - transform.y) / transform.k,
    ];

    const newX = center[0] - translate0[0] * newK;
    const newY = center[1] - translate0[1] * newK;

    // Apply new transform
    svg.call(
      zoomBehavior.transform,
      d3.zoomIdentity.translate(newX, newY).scale(newK),
    );
  }

  // --- Reset function ---
  function reset() {
    // Reset projections
    svg.projection.scale(svg.baseScale).translate(svg.baseTranslate);
    noproj.scale(1).translate([0, 0]);
    svg.zoom = { k: 1, x: 0, y: 0 };

    // Render layers
    render({ k: 1, x: 0, y: 0 });

    // Reset D3 internal transform
    svg.call(zoomBehavior.transform, d3.zoomIdentity);
  }

  // --- Render function ---
  async function render(t) {
    for (const d of svg.zoomablelayers) {
      switch (d.mark) {
        case "circle":
          d.zoom = t;
          circle(svg, d);
          break;
        case "rhumbs":
          d.zoom = t;
          rhumbs(svg, d);
          break;
        case "symbol":
          d.zoom = t;
          symbol(svg, d);
          break;
        case "square":
          d.zoom = t;
          square(svg, d);
          break;
        case "halfcircle":
          d.zoom = t;
          halfcircle(svg, d);
          break;
        case "spike":
          d.zoom = t;
          spike(svg, d);
          break;
        case "path": {
          let geom = d.dataset;
          const [zmin, zmax] = d.zoom_levels || [1, 8];

          if (Array.isArray(d.simplify) && d.simplify.length === 2) {
            const k = d.k2;
            const z = Math.max(zmin, Math.min(zmax, t.k));
            const tnorm = (z - zmin) / (zmax - zmin);
            const tol = k * Math.pow(1 / k, tnorm);

            if (!d._lastTol || Math.abs(Math.log(d._lastTol / tol)) > 0.15) {
              d._simplified = await cleangeometry(d.base, {
                k: tol,
                rewind: d.rewind,
                rewindPole: d.rewindPole,
                clipOutline: d.clipOutline,
              });
              d._lastTol = tol;
            }
            geom = d._simplified;
          }

          const gpath = d3
            .geoPath(d.coords === "svg" ? noproj : svg.projection)
            .pointRadius(d.pointRadius);
          const selection = svg.selectAll(`#${d.id} > path`);
          (d.dataordatum === "datum"
            ? selection.datum(geom)
            : selection.data(geom.features)
          ).attr("d", gpath);
          break;
        }
        case "tissot":
          svg
            .selectAll(`#${d.id} > path`)
            .attr(
              "d",
              d3.geoPath(d.coords === "svg" ? noproj : svg.projection),
            );
          break;
        case "clippath":
          svg.selectAll(`#${d.id} > path`).attr("d", path);
          break;
        case "text":
          d.zoom = t;
          text(svg, d);
          break;
        case "outline":
          svg.selectAll(`#${d.id} > path`).attr("d", path({ type: "Sphere" }));
          break;
        case "graticule":
          svg.selectAll(`#${d.id} > path`).attr("d", path);
          break;
        case "sketch":
          d.zoom = t;
          sketch(svg, d);
          break;
        case "tile":
          tile(svg, d);
          break;
        case "contour":
          contour(svg, d);
          break;
        case "earth":
          earthReproject(svg, d);
          break;
        case "scalebar":
          scalebar(svg, d);
          break;
        case "north":
          north(svg, d);
          break;
      }
    }
  }

  // --- D3 zoom handler ---
  function zoomed({ transform }) {
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
