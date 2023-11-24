// check attributes
export function check(input, columns) {
  if (typeof input == "function") {
    return input;
  } else if (typeof input == "string" && columns.includes(input)) {
    return (d) => d.properties[input];
  } else {
    return input;
  }
}
