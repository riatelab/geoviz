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

  // Button <- ICI
  const buttonZoomIn = svg.append("g").attr("id", "zoomplus");

  buttonZoomIn
    .append("rect")
    .attr("fill", "red")
    .attr("x", svg.width - 30)
    .attr("y", 10)
    .attr("width", 20)
    .attr("height", 20)
    .on("click", (e) => {
      const direction = 1; // 1 : zoom in
      handleClickZoom(direction);
    })
    .on("dblclick", (e) => {
      e.stopPropagation();
    });

  buttonZoomIn
    .append("path")
    .attr(
      "d",
      `m 14.46318,24.454908
    c -0.440229,-0.155134 -0.958225,-0.700602 -1.079909,-1.13718 -0.05901,-0.211679 -0.09383,-1.514433 -0.09413,-3.521146
    l -4.86e-4,-3.185158 -3.284324,-0.002
    C 7.015736,16.607712 6.6886014,16.593355 6.3712504,16.449735 5.4456884,16.03086 5.0408643,14.899546 5.5000211,14.015013
    c 0.1809797,-0.348645 0.6888083,-0.761097 1.0653516,-0.865266 0.2017287,-0.05581 1.5633205,-0.0911 3.5259583,-0.0914
    l 3.197322,-4.83e-4 4.86e-4,-3.1851586
    c 2.97e-4,-1.9551707 0.03573,-3.3115818 0.09175,-3.5125431 0.104567,-0.3751113 0.518595,-0.881008 0.86857,-1.0612992 0.37135,-0.1913019 0.880019,-0.2410519 1.303407,-0.1274787 0.49329,0.1323236 1.073052,0.6949622 1.205367,1.1697648 0.0626,0.2246516 0.0967,1.4658679 0.09702,3.5315562
    l 4.85e-4,3.1851586 3.197323,4.83e-4
    c 1.962638,2.97e-4 3.324229,0.03559 3.525958,0.0914 1.206009,0.333637 1.655317,1.879976 0.821227,2.826339 -0.553151,0.627605 -0.577671,0.63125 -4.260183,0.633385
    l -3.284325,0.002 -4.85e-4,3.185157
    c -3.15e-4,2.065689 -0.03441,3.306906 -0.09702,3.531557 -0.126021,0.452214 -0.710371,1.034341 -1.164312,1.159883 -0.450822,0.124679 -0.70401,0.117264 -1.130739,-0.03312
    z`
    )
    .attr("transform", "translate(100 100)")
    .attr("pointer-events", "none");

  const buttonZoomOut = svg
    .append("g")
    .attr("id", "zoomminus")
    .append("rect")
    .attr("fill", "blue")
    .attr("x", svg.width - 30)
    .attr("y", 30)
    .attr("width", 20)
    .attr("height", 20)
    .on("click", (e) => {
      const direction = -1; // -1 : zoom out
      handleClickZoom(direction);
    })
    .on("dblclick", (e) => {
      e.stopPropagation();
    });

  const buttonReset = svg
    .append("g")
    .attr("id", "zoomminus")
    .append("rect")
    .attr("fill", "black")
    .attr("x", svg.width - 30)
    .attr("y", 60)
    .attr("width", 20)
    .attr("height", 20)
    .on("click", reset)
    .on("dblclick", (e) => {
      e.stopPropagation();
    });

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
    const factor = 0.2;
    const center = [svg.width / 2, svg.height / 2];
    const transform = d3.zoomTransform(svg.node());
    const view = { ...transform };
    view.k = transform.k * (1 + factor * direction);
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
