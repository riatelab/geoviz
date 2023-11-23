export function stringify(x) {
  let output = {};
  let func = [];
  for (const [key, value] of Object.entries(x)) {
    let val = value;
    if (typeof value == "function") {
      val = value.toString();
      func.push(key);
    }
    output = Object.assign(output, {
      [key]: val,
    });
  }
  Object.assign(output, { _func: JSON.stringify(func) });
  return JSON.stringify(output, (k, v) => (v === undefined ? null : v));
}
