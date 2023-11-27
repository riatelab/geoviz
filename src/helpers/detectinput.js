export function detectinput(input, columns) {
  if (typeof input == "function") {
    console.log("function");
    return "function";
  } else if (typeof input == "string" && columns.includes(input)) {
    console.log("field");
    return "field";
  } else {
    console.log("value");
    return "value";
  }
}
