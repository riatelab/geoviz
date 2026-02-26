import versor from "versor";
import { circle } from "../mark/circle";
import { contour } from "../mark/contour";
import { rhumbs } from "../mark/rhumbs";
import { symbol } from "../mark/symbol";
import { square } from "../mark/square";
import { halfcircle } from "../mark/halfcircle";
import { spike } from "../mark/spike";
import { text } from "../mark/text";
import { tile } from "../mark/tile";
import { scalebar } from "../mark/scalebar";
import { north } from "../mark/north";
import { earthReproject } from "../mark/earth";
import { pointers } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import { geoPath, geoIdentity } from "d3-geo";
import * as geoScaleBar from "d3-geo-scale-bar";
import { select } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { cleangeometry } from "../tool/cleangeometry.js";

const d3 = Object.assign({}, geoScaleBar, {
  zoom,
  zoomIdentity,
  pointers,
  geoPath,
  geoIdentity,
  select,
  scaleLinear,
  max,
});

export async function zoomversor(svg) {
  async function render() {
    for (const d of svg.zoomablelayers) {
      const path = d3.geoPath(svg.projection);
      switch (d.mark) {
        case "rhumbs":
          rhumbs(svg, d);
          break;
        case "circle":
          circle(svg, d);
          break;
        case "symbol":
          symbol(svg, d);
          break;
        case "square":
          square(svg, d);
          break;
        case "halfcircle":
          halfcircle(svg, d);
          break;
        case "spike":
          spike(svg, d);
          break;
        case "path": {
          let geom = d.dataset;

          if (Array.isArray(d.simplify) && d.simplify.length === 2) {
            const [zmin, zmax] = [1, 8];
            const smin = svg.projection._scale * zmin;
            const smax = svg.projection._scale * zmax;
            const t = (svg.projection.scale() - smin) / (smax - smin);
            const zoomLevel = zmin + t * (zmax - zmin);
            const k = d.k2;
            const z = Math.max(zmin, Math.min(zmax, zoomLevel));
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

          svg
            .selectAll(`#${d.id} > path`)
            .data(geom.features)
            .attr(
              "d",
              d3
                .geoPath(d.coords === "svg" ? noproj : svg.projection)
                .pointRadius(d.pointRadius),
            );

          break;
        }

        case "tissot":
          svg
            .selectAll(`#${d.id} > path`)
            .attr("d", d3.geoPath(svg.projection).pointRadius(d.pointRadius));
          break;

        case "clippath":
          svg.selectAll(`#${d.id} > path`).attr("d", path);
          break;
        case "text":
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
  svg
    .call(versorzoom(svg.projection).on("zoom.render end.render", render))
    .call(render)
    .node();
}

function versorzoom(
  projection,
  {
    // Capture the projection’s original scale, before any zooming.
    scale = projection._scale === undefined
      ? (projection._scale = projection.scale())
      : projection._scale,
    scaleExtent = [1, 8],
  } = {},
) {
  let v0, q0, r0, a0, tl;

  console.log("scale", scale);
  const zoom = d3
    .zoom()
    .filter((event) => {
      if (event.type === "wheel") event.preventDefault();
      return true;
    })
    .scaleExtent(scaleExtent.map((x) => x * scale))
    .on("start", zoomstarted)
    .on("zoom", zoomed);

  function point(event, that) {
    const t = d3.pointers(event, that);

    if (t.length !== tl) {
      tl = t.length;
      if (tl > 1) a0 = Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]);
      zoomstarted.call(that, event);
    }

    return tl > 1
      ? [
          d3.mean(t, (p) => p[0]),
          d3.mean(t, (p) => p[1]),
          Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]),
        ]
      : t[0];
  }

  function zoomstarted(event) {
    v0 = versor.cartesian(projection.invert(point(event, this)));
    q0 = versor((r0 = projection.rotate()));
  }

  function zoomed(event) {
    projection.scale(event.transform.k);
    const pt = point(event, this);
    const v1 = versor.cartesian(projection.rotate(r0).invert(pt));
    const delta = versor.delta(v0, v1);
    let q1 = versor.multiply(q0, delta);

    // For multitouch, compose with a rotation around the axis.
    if (pt[2]) {
      const d = (pt[2] - a0) / 2;
      const s = -Math.sin(d);
      const c = Math.sign(Math.cos(d));
      q1 = versor.multiply([Math.sqrt(1 - s * s), 0, 0, c * s], q1);
    }

    projection.rotate(versor.rotation(q1));

    // In vicinity of the antipode (unstable) of q0, restart.
    if (delta[0] < 0.7) zoomstarted.call(this, event);
  }

  return Object.assign(
    (selection) =>
      selection
        .property("__zoom", d3.zoomIdentity.scale(projection.scale()))
        .call(zoom),
    {
      on(type, ...options) {
        return options.length
          ? (zoom.on(type, ...options), this)
          : zoom.on(type);
      },
    },
  );
}
