import { detectinput } from "../helpers/detectinput";
import { columns } from "../helpers/columns";
import { descending } from "d3-array";
const d3 = Object.assign({}, { descending });

export function order(features, arg, { fields, descending = true } = {}) {
  fields = fields ? fields : columns(features.map((d) => d.properties));
  switch (detectinput(arg, fields)) {
    case "value":
      return features;
    case "function":
      return features.sort(arg);
    case "field":
      if (descending) {
        return features.sort((a, b) =>
          d3.descending(
            Math.abs(+a.properties[arg]),
            Math.abs(+b.properties[arg])
          )
        );
      } else {
        return features.sort((a, b) =>
          d3.descending(
            Math.abs(+b.properties[arg]),
            Math.abs(+a.properties[arg])
          )
        );
      }
  }
}
