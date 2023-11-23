export function parse(x) {
  let output = {};
  let func = JSON.parse(JSON.parse(x)._func);
  for (const [key, value] of Object.entries(JSON.parse(x))) {
    output = Object.assign(output, {
      [key]: func.includes(key) ? eval(value) : value,
    });
  }
  delete output._func;
  return output;
}
