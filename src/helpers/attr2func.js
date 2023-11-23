import { detectinput } from "../helpers/detectinput";

export function attr2func(attr, cols) {
  switch (detectinput(attr, cols)) {
    case "function":
      console.log("function");
      return attr;
    case "field":
      console.log("field");
      return (d) => d.properties[attr];
    case "value":
      console.log("value");
      return (d) => attr;
  }
}
