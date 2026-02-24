import { simplify, makevalid } from "geotoolbox";

export async function simpl(data, { k, tovalid = true }) {
  const kval = k === "auto" || k === true ? undefined : k;

  let result = simplify(data, { k: kval });

  if (tovalid) {
    result = await makevalid(result);
  }
  return result;
}
