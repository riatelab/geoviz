import { camelcasetodash } from "./camelcase";
export function addattrlegend({ params, layer, prefix, text = false } = {}) {
  if (text) {
    Object.keys(params)
      .filter((str) => str.includes("texts"))
      .forEach((d) => {
        layer.attr(camelcasetodash(d, "texts"), params[d]);
      });

    Object.keys(params)
      .filter((str) => str.includes(prefix))
      .forEach((d) => {
        layer.attr(camelcasetodash(d, prefix), params[d]);
      });
  } else {
    Object.keys(params)
      .filter((str) => str.includes(prefix))
      .forEach((d) => {
        layer.attr(camelcasetodash(d, prefix), params[d]);
      });
  }
}
