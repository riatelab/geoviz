import { select, pointers } from "d3-selection";
import { camelcasetodash } from "./utils";
const d3 = Object.assign({}, { select, pointers });

export function tooltip(
  layer,
  data,
  container,
  tip,
  tip_style = { action: "over", raise: false, layerStyle: {} },
  fields,
  view
) {
  // Helper
  function capitalize(s) {
    return String(s[0]).toUpperCase() + String(s).slice(1);
  }

  // Build tip function (string with $field, function, or true)
  function buildTipFn(tipInput) {
    if (typeof tipInput === "function") return tipInput;
    if (tipInput === true) {
      const keys = Array.from(
        new Set(
          ((data && data.features) || []).flatMap((f) =>
            Object.keys(f.properties || {})
          )
        )
      );
      return (d) =>
        keys.map((k) => `${k}: ${String(d.properties?.[k] ?? "")}`).join("\n");
    }
    if (typeof tipInput === "string") {
      const parts = tipInput.split(/(\$[A-Za-z0-9_]+)/g);
      return (d) =>
        parts
          .map((p) =>
            p.startsWith("$")
              ? String((d.properties && d.properties[p.slice(1)]) ?? "")
              : p
          )
          .join("");
    }
    return () => "";
  }

  const tipFn = buildTipFn(tip);

  // defaults
  const defaults = {
    action: "over",
    fontSize: 17,
    fill: "#4d4545",
    background: "#fcf7e6",
    stroke: "#4a4d4b",
    strokeWidth: 1,
    fontFamily: container.fontFamily,
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    overOpacity: 0.5,
    overFill: undefined,
    overStroke: undefined,
    overStrokeWidth: undefined,
    overFillOpacity: undefined,
    overStrokeOpacity: undefined,
    raise: false,
  };

  const style = Object.assign({}, defaults, tip_style || {});
  const layerStyle =
    (tip_style && tip_style.layerStyle) ||
    (layer && layer.node && layer.node().__layerStyle__) ||
    {};

  const context = container.node();

  // ensure tooltip group
  const geoviztooltip = container.select("#geoviztooltip").empty()
    ? container
        .append("g")
        .attr("id", "geoviztooltip")
        .attr("pointer-events", "none")
    : container.select("#geoviztooltip").attr("pointer-events", "none");

  let path = geoviztooltip.select("#geotooltippath");
  let text = geoviztooltip.select("#geotooltiptext");

  if (path.empty()) {
    path = geoviztooltip
      .append("g")
      .attr("id", "geotooltippath")
      .attr("fill", style.background)
      .attr("stroke", style.stroke)
      .attr("stroke-width", style.strokeWidth)
      .selectAll("path")
      .data([null])
      .join("path");
  } else {
    path = path
      .attr("fill", style.background)
      .attr("stroke", style.stroke)
      .attr("stroke-width", style.strokeWidth)
      .selectAll("path")
      .data([null])
      .join("path");
  }

  if (text.empty()) {
    text = geoviztooltip
      .append("g")
      .attr("id", "geotooltiptext")
      .attr("font-size", `${style.fontSize}px`)
      .attr("fill", style.fill)
      .attr("font-family", style.fontFamily)
      .attr("font-weight", style.fontWeight)
      .attr("font-style", style.fontStyle)
      .attr("text-decoration", style.textDecoration);
  } else {
    text = text
      .attr("font-size", `${style.fontSize}px`)
      .attr("fill", style.fill);
  }

  let currentEl = null;

  // --- NEW: read computed style safely for SVG node ---
  function getComputed(node) {
    try {
      // window.getComputedStyle on SVG element
      return window.getComputedStyle(node);
    } catch (e) {
      return null;
    }
  }

  // Resolve effective value with precedence:
  // element inline style/attr -> computedStyle -> feature.properties -> layerStyle -> defaults
  function resolveEffective(el, d) {
    const node = el.node();
    const cs = getComputed(node);

    function pick(name, attrName, fallbackPropName) {
      // try inline style
      const styleVal = el.style(name);
      if (styleVal !== null && styleVal !== undefined && styleVal !== "")
        return styleVal;
      // try attribute
      const attrVal = el.attr(attrName);
      if (attrVal !== null && attrVal !== undefined && attrVal !== "")
        return attrVal;
      // try computed style (CSS rules)
      if (cs) {
        const prop = cs.getPropertyValue(attrName);
        if (prop !== null && prop !== undefined && prop !== "") return prop;
      }
      // try feature property (use both camel and dash)
      if (d && d.properties) {
        if (d.properties[fallbackPropName] !== undefined)
          return d.properties[fallbackPropName];
        if (d.properties[attrName] !== undefined) return d.properties[attrName];
      }
      // layer style
      if (layerStyle && layerStyle[fallbackPropName] !== undefined)
        return layerStyle[fallbackPropName];
      if (layerStyle && layerStyle[attrName] !== undefined)
        return layerStyle[attrName];
      // defaults
      if (defaults[fallbackPropName] !== undefined)
        return defaults[fallbackPropName];
      return null;
    }

    return {
      fill: pick("fill", "fill", "fill"),
      stroke: pick("stroke", "stroke", "stroke"),
      opacity: pick("opacity", "opacity", "opacity"),
      strokeWidth: pick("stroke-width", "strokeWidth"),
      fillOpacity: pick("fill-opacity", "fillOpacity"),
      strokeOpacity: pick("stroke-opacity", "strokeOpacity"),
      cursor: el.style("cursor") || null,
    };
  }

  // save resolved effective values onto node
  function ensureSavedOriginal(el, d) {
    const node = el.node();
    if (!node.__oldStyle__) {
      node.__oldStyle__ = resolveEffective(el, d);
    }
  }

  // restore original (use the saved resolved values)
  function restoreOriginal(el) {
    if (!el || el.empty()) return;
    const node = el.node();
    const old = node && node.__oldStyle__;
    if (!old) return;

    // set attributes/styles to the saved resolved values (strings or null)
    if (old.fill !== null) el.style("fill", old.fill).attr("fill", old.fill);
    else {
      el.style("fill", null).attr("fill", null);
    }

    if (old.stroke !== null)
      el.style("stroke", old.stroke).attr("stroke", old.stroke);
    else {
      el.style("stroke", null).attr("stroke", null);
    }

    if (old.fillOpacity !== null)
      el.style("fill-opacity", old.fillOpacity).attr(
        "fill-opacity",
        old.fillOpacity
      );
    else {
      el.style("fill-opacity", null).attr("fill-opacity", null);
    }

    if (old.opacity !== null)
      el.attr("opacity", old.opacity).style("opacity", old.opacity);
    else {
      el.attr("opacity", null).style("opacity", null);
    }

    if (old.strokeWidth !== null)
      el.style("stroke-width", old.strokeWidth).attr(
        "stroke-width",
        old.strokeWidth
      );
    else {
      el.style("stroke-width", null).attr("stroke-width", null);
    }

    if (old.strokeOpacity !== null)
      el.style("stroke-opacity", old.strokeOpacity).attr(
        "stroke-opacity",
        old.strokeOpacity
      );
    else {
      el.style("stroke-opacity", null).attr("stroke-opacity", null);
    }

    if (old.cursor !== null) el.style("cursor", old.cursor);
    // keep saved __oldStyle__ if you want reuse, else you can delete it:
    // delete node.__oldStyle__;
  }

  // Apply overOpacity: prefer fill-opacity if the resolved effective had a non-empty fillOpacity,
  // otherwise use opacity.
  function applyOverOpacity(el) {
    if (!el || el.empty()) return;
    const node = el.node();
    const old = node && node.__oldStyle__;
    const target = style.overOpacity;
    if (target === undefined) return;

    const hasFillOpacity =
      old &&
      old.fillOpacity !== null &&
      old.fillOpacity !== undefined &&
      String(old.fillOpacity) !== "";

    if (hasFillOpacity) {
      // set both style and attr to be safe across browsers
      el.style("fill-opacity", target).attr("fill-opacity", target);
    } else {
      el.attr("opacity", target).style("opacity", target);
    }
  }

  function applyOverStyles(el) {
    if (!el || el.empty()) return;
    if (style.overFill !== undefined)
      el.style("fill", style.overFill).attr("fill", style.overFill);
    if (style.overStroke !== undefined)
      el.style("stroke", style.overStroke).attr("stroke", style.overStroke);
    if (style.overStrokeWidth !== undefined)
      el.style("stroke-width", style.overStrokeWidth).attr(
        "stroke-width",
        style.overStrokeWidth
      );
    if (style.overFillOpacity !== undefined)
      el.style("fill-opacity", style.overFillOpacity).attr(
        "fill-opacity",
        style.overFillOpacity
      );
    if (style.overStrokeOpacity !== undefined)
      el.style("stroke-opacity", style.overStrokeOpacity).attr(
        "stroke-opacity",
        style.overStrokeOpacity
      );
    if (style.overOpacity !== undefined) applyOverOpacity(el);
  }

  // if click action, set pointer cursor but save original first
  if (style.action === "click") {
    layer.selectAll("*").each(function (d) {
      const el = d3.select(this);
      ensureSavedOriginal(el, d);
      el.style("cursor", "pointer");
    });
  }

  // ensure saved on enter (so resolved values computed before modification)
  layer.selectAll("*").on("mouseenter", function (event, d) {
    const el = d3.select(this);
    ensureSavedOriginal(el, d);
  });

  // main handler
  layer
    .selectAll("*")
    .on(
      style.action === "click" ? "click" : "touchmove mousemove",
      function (event, d) {
        const el = d3.select(this);

        if (currentEl && currentEl.node() !== el.node()) {
          restoreOriginal(currentEl);
          currentEl = null;
        }

        ensureSavedOriginal(el, d);
        currentEl = el;

        // view support
        if (view && d && d.properties) {
          container.node().__value_temp__ = d.properties;
          container.dispatch("input");
        }

        geoviztooltip.style("visibility", "visible");

        const xy = d3.pointers(event, context)[0];

        // apply only to current element
        applyOverStyles(el);
        if (style.raise) el.raise();

        // build tip text
        const raw = tipFn(d);
        const lines = typeof raw === "string" ? raw.split("\n") : [String(raw)];

        text
          .selectAll("text")
          .data(lines)
          .join("text")
          .attr("dy", (line, i) => i * style.fontSize)
          .text((line) => line);

        path.attr("transform", `translate(${xy})`);
        const bbox = text.node().getBBox();
        const x = bbox.x,
          y = bbox.y,
          w = bbox.width,
          h = bbox.height;

        const x_margin = 0.33 * container.width;
        const y_margin = 0.25 * container.height;

        // same positioning logic as before
        if (xy[0] < x_margin && xy[1] < y_margin) {
          text.attr("transform", `translate(${xy[0] + 10},${xy[1] + 15 - y})`);
          path.attr(
            "d",
            `M0,0v${+h + 5 + 20}h${w + 20}v${-h - 20}h${-w - 15}z`
          );
        } else if (xy[0] > container.width - x_margin && xy[1] < y_margin) {
          text.attr(
            "transform",
            `translate(${xy[0] - w - 10},${xy[1] + 15 - y})`
          );
          path.attr(
            "d",
            `M0,0v${+h + 5 + 20}h${-w - 20}v${-h - 20}h${+w + 15}z`
          );
        } else if (xy[0] < x_margin && xy[1] > container.height - y_margin) {
          text.attr(
            "transform",
            `translate(${xy[0] + 10},${xy[1] - 15 - y - h})`
          );
          path.attr("d", `M0,0v${-h - 5 - 20}h${w + 20}v${h + 20}h${-w - 15}z`);
        } else if (
          xy[0] > container.width - x_margin &&
          xy[1] > container.height - y_margin
        ) {
          text.attr(
            "transform",
            `translate(${xy[0] - w - 10},${xy[1] - 15 - y - h})`
          );
          path.attr("d", `M0,0v${-h - 5 - 20}h${-w - 20}v${h + 20}h${w + 15}z`);
        } else if (xy[1] > container.height - y_margin) {
          text.attr(
            "transform",
            `translate(${xy[0] - w / 2},${xy[1] - 15 - y - h})`
          );
          path.attr(
            "d",
            `M${-w / 2 - 10},-5H-5l5,5l5,-5H${w / 2 + 10}v${-h - 20}h-${
              w + 20
            }z`
          );
        } else if (xy[0] < x_margin) {
          text.attr(
            "transform",
            `translate(${xy[0] + 15},${xy[1] - y - h / 2})`
          );
          path.attr(
            "d",
            `M0,0l5,5v${h / 2 + 5}h${w + 20}v${-h - 20}h${-w - 20}v${
              h / 2 + 5
            }z`
          );
        } else if (xy[0] > container.width - x_margin) {
          text.attr(
            "transform",
            `translate(${xy[0] - w - 15},${xy[1] - y - h / 2})`
          );
          path.attr(
            "d",
            `M0,0l-5,5v${h / 2 + 5}h${-w - 20}v${-h - 20}h${w + 20}v${
              h / 2 + 5
            }z`
          );
        } else {
          text.attr(
            "transform",
            `translate(${xy[0] - w / 2},${xy[1] - y + 15})`
          );
          path.attr(
            "d",
            `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`
          );
        }
      }
    );

  // leave: restore
  layer.selectAll("*").on("mouseleave touchend", function (event, d) {
    const el = d3.select(this);
    if (currentEl && currentEl.node() === el.node()) {
      restoreOriginal(currentEl);
      currentEl = null;
    } else {
      restoreOriginal(el);
    }
    geoviztooltip.style("visibility", "hidden");
    if (view) {
      container.node().__value_temp__ = {};
      container.dispatch("input");
    }
  });

  // view getter
  if (view) {
    Object.defineProperty(container.node(), "value", {
      get: () => container.node().__value_temp__ || {},
    });
  }
}
