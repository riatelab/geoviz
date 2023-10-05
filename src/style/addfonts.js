/**
 * The `addonts` function allows add font to the document from an url
 *
 * @param {string} fontFamily - font family name
 * @param {string} url - tff- file url
 */
export function addfonts(
  fonts // [{ fontFamily, url, style, weight, stretch }]
) {
  const fontNames = fonts.map((f) => {
    const fontFace = new FontFace(f.fontFamily, `url(${f.url})`, {
      style: f.style,
      weight: f.weight,
      stretch: f.stretch,
    });
    fontFace.load();
    document.fonts.add(fontFace);
    return f;
  });
  return fontNames;
}
