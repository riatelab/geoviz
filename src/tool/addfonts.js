/**
 * The `addont` function allows add font to the document from an url
 * It can be use ta add a shadow effect
 *
 * @param {string} url - font url. See https://fonts.google.com/
 * @example
 * viz.tool.addfont("https://fonts.googleapis.com/css2?family=Kenia")
 */
export function addfonts(fonts) {
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
  //return fontNames;
}
