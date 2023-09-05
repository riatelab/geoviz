// Borrow from Amr Ali in https://stackoverflow.com/a/48764436

export function roundarray(arr, precision) {
  return [
    floor(arr[0], precision),
    arr.slice(1, -1).map((d) => round(d, precision)),
    ceil(arr[arr.length - 1], precision),
  ].flat();
}

function round(number, precision) {
  const p = Math.pow(10, precision);
  const n = number * p * (1 + Number.EPSILON);
  return Math.round(n) / p;
}

function floor(number, precision) {
  const p = Math.pow(10, precision);
  const n = number * p * (1 + Math.sign(number) * Number.EPSILON);
  return Math.floor(n) / p;
}

function ceil(number, precision) {
  const p = Math.pow(10, precision);
  const n = number * p * (1 - Math.sign(number) * Number.EPSILON);
  return Math.ceil(n) / p;
}
