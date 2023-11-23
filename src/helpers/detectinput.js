export function detectinput(input, columns) {
  if (typeof input == "function") {
    return "function";
  } else if (typeof input == "string" && columns.includes(input)) {
    return "field";
  } else {
    return "value";
  }
}
