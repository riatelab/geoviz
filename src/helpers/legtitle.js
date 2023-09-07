import { camelcasetodash } from "./camelcase";
export function legtitle(layer, options, prefix, dy = 0) {
  if (options?.[prefix + "_text"]) {
    const defaultvalues = {
      texts_fontSize: 14,
      texts_fill: "#363636",
    };
    const params = Object.assign(defaultvalues, options);

    let title = layer.append("g").attr("transform", `translate(0, ${dy})`);
    let h = params[prefix + "_fontSize"]
      ? params[prefix + "_fontSize"]
      : params["texts_fontSize"];
    title
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "hanging")
      .selectAll("text")
      .data(params[prefix + "_text"].split("\n"))
      .join("text")
      .attr("dy", (d, i) => i * h)
      .text((d) => d);

    // General styles for all texts in the legend
    Object.keys(params)
      .filter((str) => str.includes("texts"))
      .forEach((d) => {
        title.attr(camelcasetodash(d, "texts"), params[d]);
      });

    // Specific styles for this kind of text (title, subtile, note)
    Object.keys(params)
      .filter((str) => str.includes(prefix))
      .forEach((d) => {
        title.attr(camelcasetodash(d, prefix), params[d]);
      });
    dy += params[prefix + "_text"].split("\n").length * h;
  }
  return dy;
}
