export function camelcasetodash(str, prefix = "") {
  return str
    .split(/(?=[A-Z])/)
    .map((d) => d.toLowerCase())
    .join("-")
    .replace(prefix + "_", "");
}
