export function addconst(features, value, name = "___const") {
  features = JSON.parse(JSON.stringify(features));
  let prop = features.map((d) => d.properties);
  prop = prop.map((d) => Object.assign({ ...d }, { [name]: value }));
  features.forEach((d, i) => (d.properties = prop[i]));
  return features;
}
