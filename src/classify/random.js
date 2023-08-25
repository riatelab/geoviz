export function random() {
  const cols = [
    "#B2DF8A",
    "#33A02C",
    "#FB9A99",
    "#E31A1C",
    "#FDBF6F",
    "#FF7F00",
    "#CAB2D6",
    "#6A3D9A",
    "#FFFF99",
    "#B15928",
    "#32A251",
    "#ACD98D",
    "#FF7F0F",
    "#FFB977",
    "#B85A0D",
    "#FFD94A",
    "#39737C",
    "#86B4A9",
    "#82853B",
    "#CCC94D",
  ];
  return cols[Math.floor(Math.random() * cols.length)];
}
