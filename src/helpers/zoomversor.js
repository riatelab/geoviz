import versor from "versor@0.2";
import { pointers } from "d3-selection";
import { zoom, zoomIdentity } from "d3-zoom";
import { geoPath, geoIdentity } from "d3-geo";
import * as geoScaleBar from "d3-geo-scale-bar";
import { select } from "d3-selection";

const d3 = Object.assign({}, geoScaleBar, {
  zoom,
  zoomIdentity,
  pointers,
  geoPath,
  geoIdentity,
  select,
});

export function zoomversor(svg) {
  function render() {
    // Path
    const path = d3.geoPath(svg.projection);
    svg.selectAll(".zoomable > path").attr("d", path);

    // ClipPath
    svg.selectAll(".zoomable > clipPath > path").attr("d", path);

    // Circles
    svg
      .selectAll(".zoomable > circle")
      .attr("cx", (d) => d3.geoPath(svg.projection).centroid(d.geometry)[0])
      .attr("cy", (d) => d3.geoPath(svg.projection).centroid(d.geometry)[1])
      .attr("visibility", (d) =>
        isNaN(d3.geoPath(svg.projection).centroid(d.geometry)[0])
          ? "hidden"
          : "visible"
      );
    // Outline
    svg
      .selectAll(".zoomableoutline > path")
      .attr("d", d3.geoPath(svg.projection)({ type: "Sphere" }));
    // Texts
    svg
      .selectAll(".zoomable > text")
      .attr("x", (d) => d3.geoPath(svg.projection).centroid(d.geometry)[0])
      .attr("y", (d) => d3.geoPath(svg.projection).centroid(d.geometry)[1])
      .attr("visibility", (d) =>
        isNaN(d3.geoPath(svg.projection).centroid(d.geometry)[0])
          ? "hidden"
          : "visible"
      );

    // Scale
    if (!svg.selectAll(".zoomablescalebar").empty()) {
      let scalebarnodes = svg.selectAll(".zoomablescalebar");
      scalebarnodes.selectAll("*").remove();
      for (let i = 0; i < scalebarnodes.size(); i++) {
        let n = d3.select(scalebarnodes.nodes()[i]);
        const datalayer = JSON.parse(n.attr("data-layer"));
        n.call(
          d3
            .geoScaleBar()
            .projection(svg.projection)
            .size([svg.width, svg.height])
            .left(datalayer.left)
            .top(datalayer.top)
            .distance(datalayer.distance)
            .label(datalayer.label)
            .units(datalayer.units)
            .tickPadding(datalayer.tickPadding)
            .tickSize(datalayer.tickSize)
            .tickFormat(eval(datalayer.tickFormat))
            .tickValues(datalayer.tickValues)
            .labelAnchor(datalayer.labelAnchor)
        );

        if (datalayer.translate) {
          n.attr(
            "transform",
            `translate(${datalayer.pos[0] + datalayer.translate[0]},${
              datalayer.pos[1] + datalayer.translate[1]
            })`
          );
        }
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
    scaleExtent = [0.8, 8],
  } = {}
) {
  let v0, q0, r0, a0, tl;

  const zoom = d3
    .zoom()
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
    }
  );
}
