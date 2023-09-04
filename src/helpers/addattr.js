import { camelcasetodash } from "./camelcase";
export function addattr({ layer, args = [], exclude = [] } = {}) {
  if (args) {
    let arr = exclude.concat(["id", "data", "tip", "tip_style"]);
    Object.keys(args)
      .filter((x) => !arr.includes(x))
      .forEach((d) => {
        layer.attr(camelcasetodash(d), args[d]);
      });
  }
}
