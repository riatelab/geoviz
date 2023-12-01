import { create } from "../container/create";
import { render } from "../container/render";
import { camelcasetodash } from "../helpers/camelcase";
import { getsize } from "../helpers/getsize";
import {
  addTitle,
  addSubtitle,
  addNote,
  subsetobj,
  addText,
  addFrame,
  manageoptions,
} from "../helpers/utils_legend.js";

export function typo_vertical(arg1, arg2) {
  // Test if new container
  let newcontainer =
    arguments.length <= 1 && !arguments[0]?._groups ? true : false;
  arg1 = newcontainer && arg1 == undefined ? {} : arg1;
  arg2 = arg2 == undefined ? {} : arg2;
  let svg = newcontainer ? create() : arg1;
  // Arguments
  const options = {
    types: ["A", "B", "C", "D"],
    colors: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"],
    alphabetical: true,
    rect_spacing: 3,
  };
  let opts = manageoptions(options, newcontainer ? arg1 : arg2, svg.fontFamily);

  // init layer
  let layer = svg.selectAll(`#${opts.id}`).empty()
    ? svg.append("g").attr("id", opts.id)
    : svg.select(`#${opts.id}`);
  layer.selectAll("*").remove();

  // Title
  addTitle(layer, opts);

  // Subtitle
  addSubtitle(layer, opts);

  // Sort
  if (opts.alphabetical) {
    let all = opts.types.map((d, i) => [d, opts.colors[i]]).sort();
    opts.types = all.map((d) => d[0]);
    opts.colors = all.map((d) => d[1]);
  }

  // Boxes
  let size = getsize(layer);
  let rect = layer.append("g");
  let opts_rect = subsetobj(opts, {
    prefix: "rect_",
    exclude: ["fill", "width", "height", "spacing"],
  });
  Object.entries(opts_rect).forEach((d) =>
    rect.attr(camelcasetodash(d[0]), d[1])
  );

  let posy = opts.pos[1] + size.height + opts.gap + opts.rect_dy;
  let posx = opts.pos[0] + opts.rect_dx;

  rect
    .selectAll("rect")
    .data(opts.colors)
    .join("rect")
    .attr("x", posx)
    .attr(
      "y",
      (d, i) =>
        posy +
        opts.rect_spacing / 2 +
        i * (opts.rect_height + opts.rect_spacing)
    )
    .attr("width", opts.rect_width)
    .attr("height", opts.rect_height)
    .attr("fill", (d) => d);

  // values
  let values = layer.append("g");
  const opts_values = Object.assign(
    subsetobj(opts, { prefix: "values_" }),
    subsetobj(opts, { prefix: "text_" })
  );

  Object.entries(opts_values).forEach((d) =>
    values.attr(camelcasetodash(d[0]), d[1])
  );

  values
    .selectAll("text")
    .data(opts.types)
    .join("text")
    .attr("x", posx + opts.rect_width + opts.values_dx)
    .attr(
      "y",
      (d, i) =>
        posy +
        opts.rect_spacing / 2 +
        i * (opts.rect_height + opts.rect_spacing) +
        opts.rect_height / 2
    )
    .text((d) => d);

  // Missing

  if (opts.missing) {
    let missing = layer.append("g");
    let size = getsize(layer);
    let opts_rect = subsetobj(opts, { prefix: "rect_", exclude: ["dx", "dy"] });
    opts_rect.fill = opts.missing_fill;
    opts_rect.x = opts.pos[0] + opts_rect.dx;
    opts_rect.y =
      size.y +
      size.height +
      opts.gap +
      opts_rect.dy +
      Math.max(opts.gap, opts.rect_spacing);
    let box = missing.append("rect");
    Object.entries(opts_rect).forEach((d) =>
      box.attr(camelcasetodash(d[0]), d[1])
    );

    opts_values.text = opts.missing_text;
    opts_values.pos = [
      opts.pos[0] + opts.rect_width,
      size.y +
        size.height +
        opts.gap +
        opts_rect.dy +
        opts_rect.height / 2 +
        Math.max(opts.gap, opts.rect_spacing),
    ];
    addText(missing, opts_values);
  }

  // Note
  addNote(layer, opts);

  // Frame
  if (opts.frame) {
    addFrame(layer, opts);
  }

  // Output;
  if (newcontainer) {
    const size = getsize(layer);
    svg
      .attr("width", size.width)
      .attr("height", size.height)
      .attr("viewBox", [size.x, size.y, size.width, size.height]);
    return render(svg);
  } else {
    return `#${opts.id}`;
  }
}
