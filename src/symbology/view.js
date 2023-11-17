import { create } from "../container/create";
import { geopath } from "../layer/geopath";
import { render } from "../container/render";

export function view(x) {
  let svg = create({
    zoomable: true,
  });
  geopath(svg, { data: x, tip: true, strokeWidth: 1.5 });
  return render(svg);
}
