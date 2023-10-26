export function northangle(pos, projection) {
  const geopos = projection.invert(pos);
  const geopostop = projection([geopos[0], geopos[1] + 3]);
  const geoposbottom = projection([geopos[0], geopos[1] - 3]);
  const xdelta = geopostop[0] - geoposbottom[0];
  const ydelta = geoposbottom[1] - geopostop[1];
  let angle = Math.atan(xdelta / ydelta) * (180 / Math.PI);
  const posnorth = projection([0, 90]);
  if (pos[1] < posnorth[1]) {
    angle = rotate + 180;
  }
  return angle;
}
